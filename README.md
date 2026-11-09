# Del dato a una decisión

Experiencia web interactiva para explorar cómo los datos pueden ayudar a tomar una decisión cotidiana. A través de un caso de pronóstico de lluvia, cada visitante recorre un análisis breve, interpreta probabilidades y evalúa los límites de una regla predictiva.

**Demo en vivo:** [multiverso-tau.vercel.app](https://multiverso-tau.vercel.app) · **Autor:** [@ardeco9091](https://github.com/ardeco9091)

## El proyecto

La aplicación propone siete pasos guiados alrededor de una pregunta concreta: **¿llevarías paraguas mañana?** El visitante observa una pequeña tabla de días simulados, compara situaciones de cielo nublado y despejado, interpreta una probabilidad y elige qué hacer con esa información.

La propuesta pone el foco en el razonamiento y la comunicación de datos: una estimación sirve para decidir, pero no es una certeza. El resultado invita a considerar los errores del modelo y qué información adicional permitiría mejorar el análisis.

## Funcionalidades

- Recorrido interactivo de siete preguntas, pensado para público sin conocimientos técnicos previos.
- Visualización del conjunto de datos y de las probabilidades condicionales.
- Explicación de una regla sencilla y de sus aciertos y errores.
- Ficha personal imprimible y formato de dos tarjetas por hoja.
- Tablero de respuestas de la exposición y descarga CSV, cuando se configura la base de datos.
- Funcionamiento del recorrido principal sin registro ni credenciales.
- Diseño adaptable a celular y computadora.

## Cómo se construye la estimación

El caso didáctico utiliza **20 días simulados**:

| Situación | Llovió | No llovió | Probabilidad de lluvia observada |
| --- | ---: | ---: | ---: |
| Nublado | 5 de 7 días | 2 de 7 días | 5/7 ≈ 71 % |
| Despejado | 2 de 13 días | 11 de 13 días | 2/13 ≈ 15 % |

Para un pronóstico con 80 % de probabilidad de cielo nublado, la estimación combina ambos escenarios:

```text
(0,80 × 0,71) + (0,20 × 0,15) ≈ 0,60
```

El resultado es una probabilidad aproximada del 60 % de lluvia. La regla ilustrativa “nublado = lluvia / despejado = no lluvia” acierta 16 de los 20 días del ejemplo. Estos números se usan para aprender: **no son datos meteorológicos reales ni una validación independiente del modelo**.

## Tecnologías

- **Next.js 14** y **React 18** para la aplicación web.
- **Tailwind CSS 3** para estilos.
- **qrcode** para generar códigos QR en las fichas.
- **PostgreSQL compatible con Neon** para guardar respuestas anónimas de la exposición, si se configura.
- **Vercel** para el despliegue.

## Ejecutar localmente

Requisitos: Node.js 18 o superior y npm.

```bash
git clone https://github.com/ardeco9091/multiverso.git
cd multiverso
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

El recorrido funciona sin configurar servicios externos. Si no se establece `DATABASE_URL`, las respuestas no se comparten entre visitantes.

## Guardado de respuestas (opcional)

La API utiliza PostgreSQL y crea la tabla `decision_responses` al recibir o consultar información. Para habilitar el tablero compartido y la exportación CSV:

1. Creá una base PostgreSQL compatible con Neon.
2. Copiá `.env.example` como `.env.local` y asigná la cadena de conexión a `DATABASE_URL`.
3. En Vercel, configurá la misma variable de entorno y volvé a desplegar.

Las respuestas guardadas son anónimas: no se almacena el alias de la ficha ni otros identificadores. Nunca publiques `.env.local` ni credenciales de la base de datos.

## Estructura principal

```text
src/app/
├── page.jsx                 # Recorrido guiado
├── result/page.jsx          # Resultado y ficha del visitante
├── card/page.jsx            # Ficha imprimible
├── sheet/page.jsx           # Dos fichas por hoja
├── estadisticas/page.jsx    # Tablero de la exposición
└── api/decision/route.js    # API y persistencia opcional
```

## Alcance y siguientes pasos

El ejemplo usa una muestra pequeña y simulada, por lo que no sirve para tomar decisiones meteorológicas reales. Como evolución, se pueden incorporar datos observados, comparar la regla con métodos alternativos y estudiar cómo cambian las respuestas al ampliar la muestra.

---

Proyecto educativo desarrollado para presentar la Tecnicatura Superior en Ciencias de Datos e Inteligencia Artificial del IES N.º 9.
