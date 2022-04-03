/*
 * HelloService simply says hello
 */

const sayHello = async (): Promise<{ msg: string }> => {
  return new Promise((resolve, _reject) => resolve({ msg: 'Hello Api' }));
};


export const helloService = {
  sayHello
};