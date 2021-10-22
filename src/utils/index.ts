class Utils {
  static emailRegex() {
    return new RegExp("/^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i");
  }

  static validateEmail(email: any) {}
  static validateName(name: any) {}
}
export default Utils;
