class User extends AbstractUser {
  constructor(username: string, email: string, private uid: string) {
    super(username, email);
  }
}
