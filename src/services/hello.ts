export class HelloService {
  async sayHello() {
    return new Promise((resolve, _reject) => resolve({ msg: 'Hello Api' }));
  }
}