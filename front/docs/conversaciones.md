# Sistema de Conversaciones

## Objetivo
Guardar las conversaciones de los usuarios con la IA para que puedan:
- Ver sus conversaciones pasadas
- Continuar conversaciones anteriores
- Eliminar conversaciones que ya no necesiten

## Base de Datos

### Modelos

#### Conversation
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| userId | Int | FK al usuario |
| slug | String | Identificador único tipo UUID |
| title | String | Título de la conversación |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de última actualización |

#### ConversationMessage
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| conversationId | Int | FK a Conversation |
| type | String | 'user' \| 'assistant' \| 'error' |
| content | String | Contenido del mensaje |
| createdAt | DateTime | Fecha de creación |

### Relaciones
- User (1) -> Conversation (N)
- Conversation (1) -> ConversationMessage (N)

## API Endpoints

### Chat
- `POST /chat` - Enviar mensaje y recibir respuesta (guarda automáticamente)

### Conversaciones
- `GET /chat/conversations` - Listar conversaciones del usuario
- `GET /chat/conversations/:slug` - Obtener una conversación con sus mensajes
- `DELETE /chat/conversations/:slug` - Eliminar una conversación

## Comportamiento

### Guardar mensajes
1. Cuando el usuario envía un mensaje, se crea una nueva conversación si no existe slug
2. Se guarda el mensaje del usuario con type 'user'
3. Se guarda la respuesta de la IA con type 'assistant'
4. Si ocurre un error, se guarda con type 'error'

### Errores
Si ocurre un error en la conversación, se guarda el mensaje de error con:
- type: 'error'
- content: mensaje de error
