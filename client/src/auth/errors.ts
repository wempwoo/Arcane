export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class DeviceAuthenticationError extends AuthenticationError {
  constructor() {
    super('Device authentication failed. User data may be lost.');
    this.name = 'DeviceAuthenticationError';
  }
}