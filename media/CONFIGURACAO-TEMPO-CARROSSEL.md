# ⏱️ **Configuração do Tempo do Carrossel**

## 🎯 **Localização da Configuração:**

### **📁 Arquivo:** `media/scripts.js`
### **📍 Linha:** 1-10

---

## **⚙️ Configurações Disponíveis:**

### **1. Tempo de Autoplay (Principal):**
```javascript
const CONFIG = {
    slider: {
        autoPlay: true,           // ✅ Ativar/desativar autoplay
        autoPlayDelay: 5000,      // ⏱️ Tempo em milissegundos (5 segundos)
        transitionDuration: 500   // 🎬 Duração da transição (0.5 segundos)
    }
};
```

---

## **🔧 Como Ajustar o Tempo:**

### **Para Mudar o Tempo de Cada Slide:**

#### **Opção 1: Ajustar o `autoPlayDelay`**
```javascript
// Mudar de 5000ms (5 segundos) para 3000ms (3 segundos)
autoPlayDelay: 3000,  // 3 segundos por slide

// Mudar para 8000ms (8 segundos)
autoPlayDelay: 8000,  // 8 segundos por slide

// Mudar para 2000ms (2 segundos)
autoPlayDelay: 2000,  // 2 segundos por slide
```

#### **Opção 2: Desativar o Autoplay**
```javascript
autoPlay: false,  // Carrossel não muda automaticamente
```

#### **Opção 3: Ajustar a Transição**
```javascript
transitionDuration: 1000,  // Transição mais lenta (1 segundo)
transitionDuration: 200,   // Transição mais rápida (0.2 segundos)
```

---

## **📊 Valores Recomendados:**

### **Tempo por Slide:**
- **🟢 Rápido**: `2000` - 3000ms (2-3 segundos)
- **🟡 Médio**: `4000` - 6000ms (4-6 segundos) ← **ATUAL**
- **🔴 Lento**: `7000` - 10000ms (7-10 segundos)

### **Duração da Transição:**
- **🟢 Rápida**: `200` - 300ms (0.2-0.3 segundos)
- **🟡 Média**: `400` - 600ms (0.4-0.6 segundos) ← **ATUAL**
- **🔴 Lenta**: `800` - 1000ms (0.8-1 segundo)

---

## **🎯 Exemplos Práticos:**

### **Carrossel Rápido (Para Apresentações):**
```javascript
const CONFIG = {
    slider: {
        autoPlay: true,
        autoPlayDelay: 2500,      // 2.5 segundos por slide
        transitionDuration: 300   // Transição rápida
    }
};
```

### **Carrossel Lento (Para Leitura):**
```javascript
const CONFIG = {
    slider: {
        autoPlay: true,
        autoPlayDelay: 8000,      // 8 segundos por slide
        transitionDuration: 800   // Transição suave
    }
};
```

### **Carrossel Manual (Sem Autoplay):**
```javascript
const CONFIG = {
    slider: {
        autoPlay: false,           // Sem mudança automática
        autoPlayDelay: 5000,      // Não usado quando autoPlay: false
        transitionDuration: 500   // Transição ao clicar
    }
};
```

---

## **🔍 Onde Encontrar no Código:**

### **Linha 1-10 do `scripts.js`:**
```javascript
// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    slider: {
        autoPlay: true,           // ← Ativar/desativar
        autoPlayDelay: 5000,      // ← TEMPO PRINCIPAL (5 segundos)
        transitionDuration: 500   // ← Duração da transição
    },
    animations: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    }
};
```

---

## **📱 Como Testar as Mudanças:**

1. **Edite o arquivo** `media/scripts.js`
2. **Mude o valor** de `autoPlayDelay`
3. **Salve o arquivo**
4. **Recarregue a página** no navegador
5. **Observe o carrossel** com o novo tempo

---

## **⚡ Dicas Importantes:**

### **1. Conversão de Tempo:**
- `1000ms = 1 segundo`
- `5000ms = 5 segundos`
- `10000ms = 10 segundos`

### **2. Valores Mínimos:**
- **Tempo mínimo recomendado**: `2000ms` (2 segundos)
- **Transição mínima**: `200ms` (0.2 segundos)

### **3. Performance:**
- Tempos muito baixos podem causar transições bruscas
- Transições muito longas podem parecer lentas

---

## **🎯 Configuração Atual:**

```javascript
autoPlayDelay: 5000,      // 5 segundos por slide
transitionDuration: 500   // 0.5 segundos de transição
```

**Para mudar, edite essas linhas no arquivo `media/scripts.js`!** ⚙️✨
