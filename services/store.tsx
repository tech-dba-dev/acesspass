import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, Profile, Company as SupabaseCompany, UserRole } from './supabase';
import { Session } from '@supabase/supabase-js';

// Types for the app
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  companyId?: string | null;
  memberCode?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  password?: string; // Only used when creating/updating users
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  benefit: string;
  address: string;
  image: string | null;
  isActive?: boolean;
}

export interface ValidationLog {
  id: string;
  companyId: string;
  companyName: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  status: 'success' | 'rejected';
}

interface AppContextType {
  // Auth state
  currentUser: User | null;
  session: Session | null;
  isLoading: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Data state
  users: User[];
  companies: Company[];
  logs: ValidationLog[];
  
  // Data methods
  fetchUsers: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  addUser: (user: Partial<User>, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserActive: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  addCompany: (company: Partial<Company>, imageFile?: File) => Promise<{ success: boolean; error?: string }>;
  updateCompany: (company: Company, imageFile?: File) => Promise<{ success: boolean; error?: string }>;
  deleteCompany: (id: string) => Promise<{ success: boolean; error?: string }>;
  addLog: (log: Partial<ValidationLog>) => Promise<void>;
  uploadCompanyImage: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteCompanyImage: (imageUrl: string) => Promise<void>;
  changeOwnPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  uploadUserAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  updateOwnAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  migrateMemberCodes: () => Promise<{ success: boolean; updated: number; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Transform Supabase profile to app User
const profileToUser = (profile: Profile): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role,
  avatar: profile.avatar,
  isActive: profile.is_active,
  companyId: profile.company_id,
  memberCode: profile.member_code,
  birthDate: profile.birth_date,
  phone: profile.phone,
});

// Transform Supabase company to app Company
const supabaseCompanyToCompany = (company: SupabaseCompany): Company => ({
  id: company.id,
  slug: company.slug,
  name: company.name,
  description: company.description,
  benefit: company.benefit,
  address: company.address,
  image: company.image,
  isActive: company.is_active,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  
  // Prevent duplicate fetch calls
  const fetchingRef = React.useRef(false);
  const lastFetchedUserId = React.useRef<string | null>(null);
  const isInitializingRef = React.useRef(true);
  const isCreatingUserRef = React.useRef(false); // Flag to ignore auth events during user creation

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    // Skip if already fetching or just fetched this user
    if (fetchingRef.current || lastFetchedUserId.current === userId) {
      console.log('⏭️ Skipping duplicate fetch for:', userId);
      return;
    }
    
    fetchingRef.current = true;
    lastFetchedUserId.current = userId;
    
    console.log('🔍 fetchUserProfile called for:', userId);
    
    try {
      console.log('📡 Fetching from Supabase...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📦 Response:', { data: data?.email, error: error?.message });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setCurrentUser(null);
      } else if (data) {
        console.log('✅ Profile loaded successfully');
        setCurrentUser(profileToUser(data as Profile));
      }
    } catch (error) {
      console.error('💥 Exception fetching profile:', error);
      setCurrentUser(null);
    } finally {
      console.log('⏹️ Setting isLoading to false');
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing auth...');
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('📝 Initial session:', session?.user?.email || 'none');
        
        if (!mounted) return;
        
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      } finally {
        // Mark initialization as complete
        isInitializingRef.current = false;
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Ignore events during initialization to prevent duplicate fetches
      if (isInitializingRef.current) {
        console.log('⏭️ Ignoring event during initialization:', event);
        return;
      }
      
      // Ignore events during user creation (admin creating users)
      if (isCreatingUserRef.current) {
        console.log('⏭️ Ignoring event during user creation:', event);
        return;
      }
      
      setSession(session);
      
      // Only fetch on explicit sign in/out events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('➡️ User signed in, fetching profile');
        // Reset the last fetched user to allow new fetch
        lastFetchedUserId.current = null;
        fetchingRef.current = false;
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out - cleaning up');
        setCurrentUser(null);
        setIsLoading(false);
        lastFetchedUserId.current = null;
        fetchingRef.current = false;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login...');
      
      // First, check if user is active before authenticating using RPC function (bypasses RLS)
      const { data: isActive, error: checkError } = await supabase
        .rpc('check_user_is_active', { user_email: email });

      if (checkError) {
        console.error('❌ Error checking user status:', checkError);
      }

      // If user exists and is inactive, block login
      if (isActive === false) {
        console.log('🚫 User account is deactivated');
        return { 
          success: false, 
          error: 'Sua conta está desativada. Entre em contato com o administrador.' 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        return { 
          success: false, 
          error: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message 
        };
      }

      if (data.user) {
        console.log('✅ Login successful, user:', data.user.email);
        // Fetch profile immediately and mark as fetched to prevent duplicate from onAuthStateChange
        lastFetchedUserId.current = data.user.id;
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Erro ao fazer login' };
    } catch (error) {
      console.error('💥 Login exception:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  // Logout
  const logout = async () => {
    console.log('🚪 Logging out...');
    
    // Clear refs first
    lastFetchedUserId.current = null;
    fetchingRef.current = false;
    
    // Clear state immediately to show login screen
    setCurrentUser(null);
    setSession(null);
    
    // Clear all Supabase related items from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Sign out from Supabase (may fail but we've already cleared local state)
    try {
      await supabase.auth.signOut({ scope: 'local' });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Supabase signOut error (ignored):', error);
    }
  };

  // Fetch all users (for admin)
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data) {
        setUsers(data.map(profileToUser));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Fetch all companies
  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      if (data) {
        setCompanies(data.map(supabaseCompanyToCompany));
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  // Fetch validation logs
  const fetchLogs = useCallback(async () => {
    try {
      // Use the enriched view for logs with company and client names
      const { data, error } = await supabase
        .from('validation_logs_enriched')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      if (data) {
        setLogs(data.map((log: any) => ({
          id: log.id,
          companyId: log.company_id,
          companyName: log.company_name,
          clientId: log.client_id,
          clientName: log.client_name,
          timestamp: log.created_at,
          status: log.status,
        })));
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser && !isLoading) {
      console.log('📊 Loading data for authenticated user...');
      fetchUsers();
      fetchCompanies();
      fetchLogs();
    }
  }, [currentUser, isLoading, fetchUsers, fetchCompanies, fetchLogs]);

  // Add user with Supabase Auth
  const addUser = async (user: Partial<User>, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Creating new user:', user.email);
      
      // Set flag to ignore auth events during user creation
      isCreatingUserRef.current = true;
      
      // Save current session before creating new user
      const { data: currentSession } = await supabase.auth.getSession();
      const adminSession = currentSession.session;
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email!,
        password: password,
        options: {
          data: {
            name: user.name,
            role: user.role,
          }
        }
      });

      if (authError) {
        console.error('❌ Error creating auth user:', authError);
        isCreatingUserRef.current = false;
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        isCreatingUserRef.current = false;
        return { success: false, error: 'Erro ao criar usuário' };
      }

      const newUserId = authData.user.id;

      // Restore admin session immediately to prevent auto-login to new user
      if (adminSession) {
        console.log('🔄 Restoring admin session...');
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      // Update profile with additional data (member_code is auto-generated by trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          role: user.role,
          is_active: user.isActive ?? true,
          company_id: user.companyId || null,
          birth_date: user.birthDate || null,
          phone: user.phone || null,
        })
        .eq('id', newUserId);

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        return { success: false, error: 'Usuário criado mas houve erro ao atualizar perfil' };
      }

      // Fetch the created profile to get the auto-generated member_code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('member_code')
        .eq('id', newUserId)
        .single();

      // Add to local state
      const newUser: User = {
        id: newUserId,
        name: user.name || '',
        email: user.email!,
        role: user.role || 'client',
        avatar: null,
        isActive: user.isActive ?? true,
        companyId: user.companyId || null,
        memberCode: profileData?.member_code || null,
        birthDate: user.birthDate || null,
        phone: user.phone || null,
      };
      
      setUsers(prev => [newUser, ...prev]);
      console.log('✅ User created successfully');
      
      // Reset flag after successful creation
      isCreatingUserRef.current = false;
      return { success: true };

    } catch (error: any) {
      console.error('💥 Exception creating user:', error);
      isCreatingUserRef.current = false;
      return { success: false, error: error.message || 'Erro ao criar usuário' };
    }
  };

  // Update user profile
  const updateUser = async (user: User, newPassword?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Updating user:', user.email);

      // If a new password is provided, update it first
      if (newPassword && newPassword.trim() !== '') {
        console.log('🔐 Updating password for user:', user.id);
        const { error: pwdError } = await supabase.rpc('admin_update_user_password', {
          target_user_id: user.id,
          new_password: newPassword,
        });

        if (pwdError) {
          console.error('❌ Error updating password:', pwdError);
          return { success: false, error: 'Erro ao atualizar senha: ' + pwdError.message };
        }
        console.log('✅ Password updated successfully');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          avatar: user.avatar,
          is_active: user.isActive,
          company_id: user.companyId || null,
          member_code: user.memberCode,
          birth_date: user.birthDate || null,
          phone: user.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error updating profile:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      if (currentUser?.id === user.id) {
        setCurrentUser(user);
      }
      
      console.log('✅ User updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('💥 Exception updating user:', error);
      return { success: false, error: error.message || 'Erro ao atualizar usuário' };
    }
  };

  // Toggle user active status
  const toggleUserActive = async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`📝 ${isActive ? 'Activating' : 'Deactivating'} user:`, id);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error toggling user status:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
      
      console.log('✅ User status updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('💥 Exception toggling user status:', error);
      return { success: false, error: error.message || 'Erro ao atualizar status do usuário' };
    }
  };

  // Delete user (Note: This only deletes the profile, not the auth user)
  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ Deleting user:', id);
      
      // First deactivate the user
      const { error: deactivateError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (deactivateError) {
        console.error('❌ Error deactivating user:', deactivateError);
        return { success: false, error: deactivateError.message };
      }

      // Then delete the profile (auth user remains but can't login due to is_active check)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return { success: false, error: error.message };
      }

      setUsers(prev => prev.filter(u => u.id !== id));
      console.log('✅ User deleted successfully');
      return { success: true };

    } catch (error: any) {
      console.error('💥 Exception deleting user:', error);
      return { success: false, error: error.message || 'Erro ao excluir usuário' };
    }
  };

  // Upload image to Supabase Storage
  const uploadCompanyImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete image from Supabase Storage
  const deleteCompanyImage = async (imageUrl: string): Promise<boolean> => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from('company-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  // Add company
  const addCompany = async (company: Partial<Company>, imageFile?: File): Promise<{ success: boolean; error?: string }> => {
    try {
      let imageUrl = company.image;

      // Upload image if provided
      if (imageFile) {
        const uploadResult = await uploadCompanyImage(imageFile);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error || 'Erro ao fazer upload da imagem' };
        }
        imageUrl = uploadResult.url;
      }

      // Try to insert with original slug, incrementing if duplicate
      let finalSlug = company.slug!;
      let attempt = 0;
      let success = false;
      let insertedData = null;

      // Try up to 10 times with incremental suffixes
      while (!success && attempt < 10) {
        const slugToTry = attempt === 0 ? finalSlug : `${finalSlug}-${attempt}`;
        
        const { data, error } = await supabase
          .from('companies')
          .insert({
            slug: slugToTry,
            name: company.name,
            description: company.description,
            benefit: company.benefit,
            address: company.address,
            image: imageUrl,
            is_active: company.isActive ?? true,
          })
          .select()
          .single();

        // Check if it's a duplicate slug error
        if (error?.code === '23505' && error.message.includes('companies_slug_key')) {
          console.log(`🔄 Slug "${slugToTry}" já existe, tentando próximo...`);
          attempt++;
          continue;
        } else if (error) {
          console.error('Error adding company:', error);
          return { success: false, error: error.message };
        }

        // Success!
        success = true;
        insertedData = data;
        if (attempt > 0) {
          console.log(`✅ Empresa criada com slug modificado: ${slugToTry}`);
        }
      }

      if (!success) {
        return { success: false, error: 'Não foi possível gerar um slug único após várias tentativas' };
      }

      if (insertedData) {
        setCompanies(prev => [...prev, supabaseCompanyToCompany(insertedData)]);
        return { success: true };
      }

      return { success: false, error: 'Erro ao adicionar empresa' };
    } catch (error: any) {
      console.error('Error adding company:', error);
      return { success: false, error: error.message };
    }
  };

  // Update company
  const updateCompany = async (company: Company, imageFile?: File): Promise<{ success: boolean; error?: string }> => {
    try {
      let imageUrl = company.image;

      // Upload new image if provided
      if (imageFile) {
        // Delete old image if exists
        if (company.image) {
          await deleteCompanyImage(company.image);
        }

        const uploadResult = await uploadCompanyImage(imageFile);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error || 'Erro ao fazer upload da imagem' };
        }
        imageUrl = uploadResult.url;
      }

      const { error } = await supabase
        .from('companies')
        .update({
          slug: company.slug,
          name: company.name,
          description: company.description,
          benefit: company.benefit,
          address: company.address,
          image: imageUrl,
          is_active: company.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        return { success: false, error: error.message };
      }

      // Update local state with the new image URL
      const updatedCompany = { ...company, image: imageUrl };
      setCompanies(prev => prev.map(c => c.id === company.id ? updatedCompany : c));
      return { success: true };
    } catch (error) {
      console.error('Error updating company:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar empresa' };
    }
  };

  // Delete company
  const deleteCompany = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find company to get image URL
      const company = companies.find(c => c.id === id);
      
      // Delete company image if exists
      if (company?.image) {
        await deleteCompanyImage(company.image);
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        return { success: false, error: error.message };
      }

      setCompanies(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting company:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao excluir empresa' };
    }
  };

  // Upload user avatar to Supabase Storage
  const uploadUserAvatar = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: error.message };
    }
  };

  // Update own avatar (for authenticated user)
  const updateOwnAvatar = async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('📸 Uploading avatar...');

      // Upload the new avatar
      const uploadResult = await uploadUserAvatar(file);
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, error: uploadResult.error || 'Erro ao fazer upload do avatar' };
      }

      console.log('✅ Avatar uploaded, updating profile...');

      // Update the profile with the new avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: uploadResult.url })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating avatar:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setCurrentUser({ ...currentUser, avatar: uploadResult.url });
      
      // Update users list if present
      setUsers(prev => prev.map(u => 
        u.id === currentUser.id ? { ...u, avatar: uploadResult.url } : u
      ));

      console.log('✅ Avatar updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar avatar' };
    }
  };

  // Change own password (for authenticated user)
  const changeOwnPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser || !session) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('🔐 Verifying current password...');

      // First, verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (signInError) {
        console.log('❌ Current password verification failed:', signInError.message);
        return { success: false, error: 'Senha atual incorreta' };
      }

      console.log('✅ Current password verified, updating to new password...');

      // Update the password using the Supabase Auth API
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('❌ Error updating password:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 Exception changing password:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao alterar senha' };
    }
  };

  // Add validation log
  const addLog = async (log: Partial<ValidationLog>) => {
    try {
      if (!currentUser) return;

      const { error } = await supabase
        .from('validation_logs')
        .insert({
          company_id: log.companyId,
          client_id: log.clientId,
          status: log.status,
          validated_by: currentUser.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding log:', error);
        return;
      }

      // Refresh logs to get the enriched data
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  // Migrate member codes to new format (XXX-XXXX-XX)
  const migrateMemberCodes = async (): Promise<{ success: boolean; updated: number; error?: string }> => {
    try {
      console.log('🔄 Starting member code migration...');
      
      // Get all clients with old format codes
      const { data: clients, error: fetchError } = await supabase
        .from('profiles')
        .select('id, member_code')
        .eq('role', 'client')
        .not('member_code', 'is', null);

      if (fetchError) {
        return { success: false, updated: 0, error: fetchError.message };
      }

      let updatedCount = 0;
      const usedCodes = new Set<string>();

      // First collect all existing codes to avoid duplicates
      clients?.forEach(c => {
        if (c.member_code) usedCodes.add(c.member_code);
      });

      for (const client of clients || []) {
        const oldCode = client.member_code;
        
        // Check if already in new format (XXX-XXXX-XX)
        if (oldCode && /^\d{3}-\d{4}-\d{2}$/.test(oldCode)) {
          continue; // Already migrated
        }

        // Generate new code in format XXX-XXXX-XX
        let newCode: string;
        do {
          const part1 = Math.floor(Math.random() * 900 + 100).toString(); // 100-999
          const part2 = Math.floor(Math.random() * 9000 + 1000).toString(); // 1000-9999
          const part3 = Math.floor(Math.random() * 90 + 10).toString(); // 10-99
          newCode = `${part1}-${part2}-${part3}`;
        } while (usedCodes.has(newCode));

        usedCodes.add(newCode);

        // Update in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ member_code: newCode })
          .eq('id', client.id);

        if (updateError) {
          console.error(`Error updating client ${client.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Migrated ${oldCode} -> ${newCode}`);
        }
      }

      // Refresh users list
      await fetchUsers();

      console.log(`✅ Migration complete. Updated ${updatedCount} codes.`);
      return { success: true, updated: updatedCount };
    } catch (error: any) {
      console.error('Migration error:', error);
      return { success: false, updated: 0, error: error.message };
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      session,
      isLoading,
      login,
      logout,
      users,
      companies,
      logs,
      fetchUsers,
      fetchCompanies,
      fetchLogs,
      addUser,
      updateUser,
      deleteUser,
      toggleUserActive,
      addCompany,
      updateCompany,
      deleteCompany,
      addLog,
      uploadCompanyImage,
      deleteCompanyImage,
      changeOwnPassword,
      uploadUserAvatar,
      updateOwnAvatar,
      migrateMemberCodes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};