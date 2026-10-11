# Chendo Calc

Calculadora científica para el navegador, creada por **Soy Chendo** como proyecto
de código abierto. Permite resolver operaciones aritméticas y científicas desde
una interfaz compacta, con el teclado visual o con el teclado físico. La operación
se mantiene visible y el resultado o los errores se muestran directamente en
pantalla.

- **Portafolio, proyectos y servicios de desarrollo:** [Enchufe Virtual](https://enchufevirtual.com)
- **Sitio web personal:** [soychendo.com](https://soychendo.com)
- **GitHub:** [github.com/soychendo](https://github.com/soychendo)
- **Repositorio:** [github.com/soychendo/chendocalc](https://github.com/soychendo/chendocalc)

## Características

- Operaciones aritméticas, paréntesis, fracciones, porcentajes y potencias.
- Raíces cuadradas y cúbicas; logaritmo decimal (`log`) y natural (`ln`).
- Funciones trigonométricas (`sin`, `cos`, `tan`) e hiperbólicas.
- Funciones inversas con `SHIFT`; cambio entre grados (`DEG`) y radianes (`RAD`).
- Constantes π y e, notación científica y resultado anterior (`Ans`).
- Memoria con suma, resta, recuperación y borrado.
- Historial de hasta 20 cálculos recientes, navegable con `REPLAY`.
- Mensajes de error visibles para expresiones incompletas, entradas no válidas,
  división por cero y resultados fuera de rango.
- Diseño adaptable a pantallas pequeñas y controles accesibles mediante teclado.

## Uso

No requiere instalación ni dependencias de compilación. Descarga o clona el
repositorio y abre `index.html` en un navegador moderno:

```bash
git clone https://github.com/soychendo/chendocalc.git
cd chendocalc
```

También puedes servir la carpeta con cualquier servidor estático y abrir la URL
local que este proporcione.

### Ejemplos de uso

Los ejemplos siguientes se pueden introducir pulsando los botones en el orden
indicado. `=` y `Calc` realizan la misma acción. La operación aparece en la línea
superior de la pantalla y el resultado, en la inferior.

#### Operaciones básicas y paréntesis

Para calcular `2 + 3 × 4`, pulsa:

```text
2 → + → 3 → × → 4 → =
```

Resultado: **14**. La multiplicación se resuelve antes que la suma. Si quieres
sumar primero, usa paréntesis:

```text
( → 2 → + → 3 → ) → × → 4 → =
```

Resultado: **20**.

#### Potencias y raíces

Para calcular `(2 + 3)²`, pulsa:

```text
( → 2 → + → 3 → ) → x² → =
```

Resultado: **25**. Para elevar al cubo, usa `x³`; para elevar a otro exponente,
introduce la base, pulsa `^`, escribe el exponente y calcula.

Para calcular la raíz cuadrada de 81:

```text
8 → 1 → √ → =
```

Resultado: **9**. El botón `√` aplica la raíz al valor que ya está en la pantalla.

#### Funciones científicas

Las funciones como seno y logaritmo se introducen con paréntesis. Para calcular
`sin(90)` en grados, verifica que el indicador muestre `DEG` y pulsa:

```text
sin → 9 → 0 → ) → =
```

Resultado: **1**. Usa `MODE` para cambiar a radianes (`RAD`) cuando la operación
requiera ángulos en radianes. `SHIFT` permite acceder a las funciones inversas;
por ejemplo, `SHIFT` + `sin` selecciona `sin⁻¹`.

Otros ejemplos:

| Operación | Secuencia resumida | Resultado |
| --- | --- | ---: |
| `log(100)` | `log → 1 → 0 → 0 → ) → =` | `2` |
| `ln(1)` | `ln → 1 → ) → =` | `0` |
| `√(81)` | `8 → 1 → √ → =` | `9` |
| `50%` | `5 → 0 → % → =` | `0.5` |

El botón `%` divide entre 100 el valor inmediatamente anterior. Por ejemplo,
`50%` representa `0.5`; no aplica automáticamente porcentajes sobre otro número.

#### Constantes, respuesta y notación científica

- Pulsa `π` para insertar la constante pi; por ejemplo, `2 × π =` da
  aproximadamente **6.28318530718**.
- Después de una operación, `Ans` inserta el último resultado en una nueva
  expresión.
- `EXP` introduce un exponente decimal. Para representar `1 × 10³`, pulsa
  `1 → EXP → 3 → =`; el resultado es **1000**.

#### Memoria e historial

1. Introduce un número y pulsa `M+` para sumarlo a la memoria.
2. Pulsa `AC` y después `Rcl` para insertar el valor guardado como `A`; pulsa `=`
   para mostrarlo.
3. Para restar un número de la memoria, introduce el número y pulsa `ALPHA` +
   `M+`.
4. Pulsa `SHIFT` + `Rcl` para borrar la memoria.
5. Pulsa `REPLAY` para recorrer las operaciones calculadas recientemente.

La memoria y el historial se mantienen mientras la página permanezca abierta;
se reinician al recargarla.

## Controles

| Control | Acción |
| --- | --- |
| `=` o `Calc` | Evalúa la operación |
| `AC` | Limpia la operación actual |
| `DEL` | Borra el último carácter |
| `MODE` | Alterna entre grados y radianes |
| `SHIFT` | Activa la función secundaria del siguiente control compatible |
| `hyp` | Activa o desactiva las funciones hiperbólicas |
| `M+` | Suma el valor actual a la memoria |
| `ALPHA` + `M+` | Resta el valor actual de la memoria |
| `Rcl` | Inserta el valor almacenado como `A` |
| `SHIFT` + `Rcl` | Borra la memoria |
| `Ans` | Inserta el último resultado |
| `REPLAY` | Recorre los cálculos recientes |
| `ON` | Enciende o apaga la calculadora |

### Teclado físico

Puedes introducir números y usar `+`, `-`, `*`, `/`, `^`, paréntesis y `%`.
`Enter` calcula, `Backspace` borra el último carácter y `Escape` limpia la
operación actual.

## Estructura del proyecto

```text
chendocalc/
├── index.html     # Interfaz y botones
├── css/style.css  # Diseño y adaptación a pantallas pequeñas
└── js/app.js      # Operaciones, controles y actualización de pantalla
```

## Tecnologías

La calculadora está construida con HTML, CSS y JavaScript nativos. El cálculo se
realiza con un evaluador de expresiones propio; no utiliza `eval`.

## Autor

**Soy Chendo** — desarrollo de este proyecto. Conoce más proyectos y servicios
en [Enchufe Virtual](https://enchufevirtual.com), el estudio y portafolio donde
presento mis proyectos de código abierto y ofrezco servicios de desarrollo web,
diseño UX/UI y productos digitales.

- Explora el portafolio y los proyectos: [enchufevirtual.com](https://enchufevirtual.com)
- Conoce más sobre Soy Chendo: [soychendo.com](https://soychendo.com)
- Encuentra el código: [github.com/soychendo](https://github.com/soychendo)

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo
[LICENSE](./LICENSE) para ver el texto completo y los términos de uso.
