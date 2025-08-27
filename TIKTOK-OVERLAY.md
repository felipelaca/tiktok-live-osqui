# 📺 TRANSPARENCIA PARA TIKTOK LIVE STUDIO

## 🎯 Configuración de Overlay Transparente

La página `/ruleta` está configurada para ser **completamente transparente** para usarla como overlay en TikTok Live Studio.

### 🌐 URL de Overlay:
```
http://tu-servidor:3005/ruleta
```

## 🔧 Configuración en TikTok Live Studio

### **Paso 1: Agregar Fuente de Browser**
1. En TikTok Live Studio, click en **"+"** 
2. Selecciona **"Browser Source"** o **"Navegador Web"**
3. Nombre: `Ruleta Transparente`

### **Paso 2: Configurar URL**
- **URL**: `http://tu-servidor:3005/ruleta`
- **Ancho**: `800px` (recomendado)
- **Alto**: `600px` (recomendado)

### **Paso 3: Configuración de Transparencia**
- ✅ **"Remove Background"** o **"Fondo Transparente"**
- ✅ **"Hardware Acceleration"** (si está disponible)
- ⚙️ **CSS Filter**: Opcional - `opacity: 0.9` para efecto sutil

### **Paso 4: Posicionamiento**
- Arrastra la ruleta a la posición deseada en tu stream
- Redimensiona según necesites
- **Tip**: Esquina superior derecha funciona bien

## 🎨 Características del Overlay

### ✅ **Completamente Transparente**
- Sin fondo de página
- Sin elementos de UI innecesarios
- Solo la ruleta y el resultado

### ✅ **Audio Habilitado**
- Sonidos de giro y victoria
- Se escuchan en el stream
- Compatible con audio de TikTok Live

### ✅ **Responsive**
- Se adapta al tamaño del browser source
- Funciona en diferentes resoluciones
- Optimizado para streaming

### ✅ **Sin Botones**
- No aparece el botón "Lanzar Ruleta"
- Control total desde `/admin`
- Interface limpia para viewers

## 🎬 Workflow de Streaming

### **Preparación:**
1. Abre `/admin` en tu navegador (para controlar)
2. Configura las opciones de la ruleta
3. Configura el browser source en TikTok Live Studio

### **Durante el Stream:**
1. Los viewers ven la ruleta transparente en pantalla
2. Tú controlas desde `/admin` en otra ventana
3. Cuando giras, todos ven el resultado simultáneamente
4. El resultado aparece con animación y sonido

### **Sincronización:**
- ✅ **Tiempo real** - Sin delay perceptible
- ✅ **Audio sincronizado** - Sonidos en momento exacto
- ✅ **Visual consistente** - Mismo resultado para todos

## 🔧 Troubleshooting

### **Si no se ve transparente:**
1. Verifica que TikTok Live Studio tenga "Remove Background" activado
2. Refresca el browser source
3. Verifica la URL: debe ser `/ruleta` no `/admin`

### **Si no se escucha el audio:**
1. Verifica configuración de audio en TikTok Live Studio
2. El audio viene del browser source, no del micrófono
3. Ajusta volumen del browser source independientemente

### **Si se ve cortado:**
1. Ajusta el tamaño del browser source
2. Recomendado: 800x600 o mayor
3. La ruleta se centra automáticamente

## 🎯 Configuración Avanzada

### **CSS Personalizado (Opcional):**
Si TikTok Live Studio permite CSS custom:
```css
body {
    background: transparent !important;
    overflow: hidden;
}

canvas {
    max-width: 100%;
    max-height: 100%;
}
```

### **Múltiples Browser Sources:**
- Puedes tener `/ruleta` en una fuente
- Y `/admin` abierto en otra ventana/monitor
- Control total mientras mantienes overlay limpio

---

**✨ ¡Listo para streaming profesional con ruleta transparente!**
