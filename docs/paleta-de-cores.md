# Paleta de Cores - Wellbeing

Este documento descreve a paleta de cores oficial do projeto Wellbeing, definida pelo design.

## Cores Principais

### Primary (Azul Turquesa)
A cor principal do sistema, usada para elementos de destaque, botões principais e links.

**Referência Pantone:** 3125 C  
**Hex Principal:** `#00A4CA`

```
primary-50:  #e6f7fc - Muito claro (backgrounds sutis)
primary-100: #cceff9 - Claro (backgrounds de destaque)
primary-200: #99dff3
primary-300: #66cfed
primary-400: #33bfe7
primary-500: #00A4CA - COR PRINCIPAL ⭐
primary-600: #008fb4 - Hover states
primary-700: #006b87 - Estados ativos/pressed
primary-800: #00485a
primary-900: #00242d - Muito escuro
```

**Usos:**
- Botões principais
- Links e textos clicáveis
- Ícones de ação
- Estados de foco em inputs
- Badges e tags
- Headers e elementos de destaque

### Secondary (Verde Lima)
Cor secundária do sistema, usada para complementar a cor principal e criar contraste visual.

**Referência Pantone:** 375 C  
**Hex Principal:** `#95C11F`

```
secondary-50:  #f5fbe9 - Muito claro
secondary-100: #ebf7d3 - Claro
secondary-200: #d7efa7
secondary-300: #c3e77b
secondary-400: #afdf4f
secondary-500: #95C11F - COR SECUNDÁRIA ⭐
secondary-600: #7a9d19 - Hover states
secondary-700: #5c7613 - Estados ativos
secondary-800: #3d4e0d
secondary-900: #1f2706 - Muito escuro
```

**Usos:**
- Badges de empresa/parceiro
- Elementos decorativos
- Acentos em gradientes
- Ilustrações e ícones secundários

### Gradiente Principal
Gradiente que combina as duas cores principais, usado para criar impacto visual.

```css
/* Gradiente padrão (135deg) */
background-image: linear-gradient(135deg, #00A4CA 0%, #95C11F 100%);

/* Gradiente hover */
background-image: linear-gradient(135deg, #008fb4 0%, #7a9d19 100%);
```

**Usos:**
- Tela de login (ilustração lateral)
- Headers de cards especiais
- Botões de destaque máximo
- Elementos de marca/branding

## Cores de Sistema

### Sucesso (Verde)
```
emerald-50:  #ecfdf5
emerald-100: #d1fae5
emerald-500: #10b981 - Sucesso
emerald-600: #059669
emerald-800: #065f46
```

### Erro (Vermelho)
```
rose-50:  #fff1f2
rose-100: #ffe4e6
rose-500: #f43f5e - Erro
rose-600: #e11d48
rose-800: #9f1239
```

### Aviso (Amarelo)
```
yellow-50:  #fefce8
yellow-100: #fef9c3
yellow-500: #eab308 - Aviso
yellow-600: #ca8a04
yellow-800: #854d0e
```

### Neutro (Cinzas)
```
neutral-50:  #f8fafc - Background geral
neutral-100: #f1f5f9 - Background cards
neutral-800: #1e293b - Textos escuros
neutral-900: #0f172a - Textos muito escuros
```

## Classes Tailwind Customizadas

### Backgrounds com Gradiente
```jsx
<div className="bg-gradient-primary">
  {/* Gradiente azul → verde */}
</div>

<button className="bg-gradient-primary hover:bg-gradient-primary-hover">
  {/* Botão com gradiente e hover */}
</button>
```

### Inputs com Focus
```jsx
<input className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
```

### Botões
```jsx
{/* Botão primário com gradiente (padrão) */}
<button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">

{/* Botão primário sólido (alternativo) */}
<button className="bg-primary-600 hover:bg-primary-700 text-white">

{/* Botão secundário outline */}
<button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50">
```

### Links
```jsx
<a className="text-primary-500 hover:text-primary-600">
```

### Badges
```jsx
{/* Badge primário */}
<span className="bg-primary-100 text-primary-800">

{/* Badge secundário */}
<span className="bg-secondary-100 text-secondary-800">

{/* Badge sucesso */}
<span className="bg-emerald-100 text-emerald-800">
```

## Acessibilidade

### Contrastes Mínimos
Todas as combinações de cor seguem as diretrizes WCAG 2.1 AA:

- **Texto em primary-500**: Use fundo branco ou neutral-50
- **Texto branco**: Use primary-600 ou mais escuro como fundo
- **Links**: primary-500 em fundos claros, primary-100 em fundos escuros

### Indicadores Visuais
Além da cor, sempre use indicadores visuais adicionais:
- Ícones para status
- Bordas para estados
- Texto descritivo

## Referências

**Paleta de Cores Original:** Conceito fornecido pela designer
- **Pantone 3125 C:** Azul Turquesa (#00A4CA)
- **Pantone 375 C:** Verde Lima (#95C11F)

**Framework:** Tailwind CSS v3+
**Arquivo de Configuração:** `/index.html` (inline config)

---

Última atualização: Dezembro 2025
