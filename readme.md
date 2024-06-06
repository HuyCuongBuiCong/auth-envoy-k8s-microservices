## External Authorization with Envoy Proxy and NestJS
We will demonstrate how to set up external authorization using Envoy Proxy and NestJS, ensuring robust access control in a microservices environment. By integrating Envoy with an external AuthService, we can create a secure and scalable system that checks user permissions and roles before allowing access to sensitive operation

Full article: [External Authorization with Envoy Proxy and NestJS](https://kelvinbz.medium.com/implementing-external-authorization-with-envoy-proxy-and-nestjs-3898752683f3)
## Request Flow
```mermaid
sequenceDiagram
    participant Client
    participant Envoy
    participant AuthService
    participant OrderService

    Client->>Envoy: 1. POST /auth/login (with credentials)
    Envoy->>AuthService: 2. Forward login request
    AuthService->>Envoy: 3. Return JWT
    Envoy->>Client: 4. Forward JWT
    Client->>Envoy: 5. GET /order (with JWT)
    Envoy->>AuthService: 6. GET /auth/ext-authz (with JWT)
    AuthService->>Envoy: 7. Return x-user-id and x-user-permissions headers or error
    Envoy->>OrderService: 8. Forward request with x-user-id and x-user-permissions headers
    OrderService->>Envoy: 9. Process and return order details for user ID or error
    Envoy->>Client: 10. Forward order details or error

```

1. The client sends a request to the Envoy proxy with a JWT token.
2. Envoy forwards the request to the AuthService to validate the JWT token.
3. AuthService returns the user ID and permissions or an error.
4. Envoy forwards the request to the OrderService with the user ID and permissions.
5. OrderService processes the request and returns the order details or an error.
6. Envoy forwards the order details or error to the client.

## Prerequisites
- Kubernetes cluster
- Helm installed
- kubectl configured

## Installation

### Deploy Services
```
node deploy-auth
node deploy-order
node deploy-product
node deploy-envoy
```

### AUTH Service

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant LocalStrategy
    participant AuthService
    participant JwtStrategy
    participant JwtAuthGuard
    participant ProtectedResource

    Client->>AuthController: 1. Login Request
    AuthController->>LocalStrategy: 2. Validate Credentials
    LocalStrategy->>AuthService: 3. Generate JWT
    AuthService->>AuthController: 4. Return JWT
    AuthController->>Client: 5. Send JWT
    Client->>ProtectedResource: 6. Access Protected Route with JWT
    ProtectedResource->>JwtAuthGuard: 7. Verify JWT
    JwtAuthGuard->>JwtStrategy: 8. Decode and Validate JWT
    JwtStrategy->>AuthService: 9. Fetch User and Roles
    AuthService->>JwtStrategy: 10. Return User and Roles
    JwtStrategy->>JwtAuthGuard: 11. Allow Access if Valid
    JwtAuthGuard->>ProtectedResource: 12. Forward Request if Valid
    ProtectedResource->>Client: 13. Return Protected Resource

```

There is no signup or registration process in this project. The user can log in with a predefined username and password. The Auth service generates a JWT token and returns it to the client. The client can then use the JWT token to access protected resources.

Use default user with roles and permissions:

```ts
// auth/src/users/users.service.ts
private async initUsers() {
    this.users = [
        {
            userId: 1,
            username: 'john',
            password: await bcrypt.hash('changeme', 10),
            roles: [Role.ADMIN],
        },
        {
            userId: 2,
            username: 'chris',
            password: await bcrypt.hash('secret', 10),
            roles: [Role.MANAGER],
        },
        {
            userId: 3,
            username: 'maria',
            password: await bcrypt.hash('guess', 10),
            roles: [Role.USER],
        },
    ];
}
```
#### ROLE AND PERMISSIONS
```ts
// auth/src/auth/roles-permissions.ts
export enum Permission {
  CREATE_ORDER = 'create_order',
  READ_ORDER = 'read_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',
}

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export const RolesPermissions = {
  [Role.ADMIN]: [
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
    Permission.DELETE_ORDER,
  ],
  [Role.MANAGER]: [
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
  ],
  [Role.USER]: [Permission.CREATE_ORDER, Permission.READ_ORDER],
};

```

#### Validate JWT and Set User Context To Request Headers

```ts
// auth/src/auth/auth.controller.ts
@All('ext-authz/*')
async authz(
    @Headers('authorization') authHeader: string,
@Res() res: Response,
) {
    console.log('entered authz');
    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('Token missing');
    }

    try {
        const decoded = this.jwtService.verify(token);
        const userId = decoded.sub; // Assuming 'sub' contains the user ID
        const user = await this.usersService.findById(userId);
        const roles = user.roles.join(',');
        const permissions = user.roles
            .flatMap((role) => RolesPermissions[role as Role])
            .join(',');

        res.setHeader('x-user-id', userId);
        res.setHeader('x-user-roles', roles);
        res.setHeader('x-user-permissions', permissions);
        res.end();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
}
```

### Order Service

#### DELETE ORDER
To delete order by order ID, the user must have the permission to delete an order. The Order service checks the user permissions in the request headers and allows the request only if the user has the required permissions.

```mermaid
sequenceDiagram
    participant Client
    participant Envoy
    participant AuthService
    participant OrderService

    Client->>Envoy: 1. DELETE /v1/orders/123 (with JWT)
    Envoy->>AuthService: 2. GET /auth/ext-authz (with JWT)
    AuthService->>Envoy: 3. Authorization response with x-user-id and x-user-permissions
    alt Has delete_order Permission
        Envoy->>OrderService: 4. Forward request with headers
        OrderService->>Envoy: 5. Order deleted successfully
        Envoy->>Client: 6. Return success response
    else Lacks delete_order Permission
        Envoy->>Client: 4. Return forbidden response
    end

```


## Test

### Get JWT Token

### Login with ADMIN
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "changeme"
}
```

### Login with USER
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "maria",
  "password": "guess"
}
```

### DELETE ORDER
```bash
DELETE http://localhost:3000/v1/orders/1
Authorization: Bearer {{token}}
```

