# Email Templates - Wellbeing

Este diretório contém os templates de email personalizados para o sistema Wellbeing.

## Template de Recuperação de Senha

O arquivo `reset-password.html` é o template usado para emails de recuperação de senha.

### Configuração no Supabase

Para usar este template personalizado no Supabase:

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://app.supabase.com
   - Selecione seu projeto

2. **Configure o Template de Email**
   - No menu lateral, clique em **Authentication**
   - Clique em **Email Templates**
   - Selecione **Reset Password**

3. **Copie o Template**
   - Abra o arquivo `reset-password.html`
   - Copie todo o conteúdo
   - Cole no editor do Supabase

4. **Variáveis Disponíveis**
   O Supabase fornece as seguintes variáveis que já estão sendo usadas no template:
   - `{{ .ConfirmationURL }}` - Link para redefinir a senha
   - `{{ .Token }}` - Token de recuperação (já incluído na URL)
   - `{{ .TokenHash }}` - Hash do token
   - `{{ .SiteURL }}` - URL do seu site

5. **Configurar Site URL**
   - Vá para **Authentication** > **URL Configuration**
   - Em **Site URL**, adicione: `https://wellbeingmz.com`
   - Em **Redirect URLs**, adicione:
     - `https://wellbeingmz.com/reset-password`
     - `http://localhost:5173/reset-password` (para desenvolvimento)

6. **Configurar SMTP (Opcional)**
   - Vá para **Project Settings** > **Auth**
   - Role até **SMTP Settings**
   - Configure seu servidor SMTP (ou use o padrão do Supabase)
   - **Recomendado**: Use o SMTP do Supabase para começar

7. **Salvar e Testar**
   - Clique em **Save** no editor de templates
   - Teste usando a funcionalidade "Esqueceu a senha" no login

## Cores da Marca

O template usa as cores oficiais do Wellbeing:

- **Azul Turquesa (Primary)**: `#00A4CA` - Pantone 3125 C
- **Verde Lima (Secondary)**: `#95C11F` - Pantone 375 C
- **Gradiente**: `linear-gradient(135deg, #00A4CA 0%, #95C11F 100%)`

## Características do Template

✅ Design responsivo (mobile-friendly)
✅ Cores da marca em gradiente
✅ Botão de ação destacado
✅ Aviso de expiração do link
✅ Avisos de segurança
✅ Link alternativo (caso o botão não funcione)
✅ Footer com informações da empresa
✅ Ano dinâmico no copyright

## Testando Localmente

Para testar o visual do email:

1. Abra o arquivo `reset-password.html` no navegador
2. Substitua manualmente `{{ .ConfirmationURL }}` por uma URL de teste
3. Verifique o layout em diferentes tamanhos de tela

## Suporte

Se tiver problemas com a configuração:
- Verifique a documentação do Supabase: https://supabase.com/docs/guides/auth/auth-email-templates
- Confirme que o Site URL está configurado corretamente
- Teste com o email de recuperação de senha
