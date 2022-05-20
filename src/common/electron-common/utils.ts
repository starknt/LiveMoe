export function delay(msec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
}

export function retry<T>(
  func: () => Promise<T>,
  maxRetry: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const retry = () => {
      func()
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          retryCount++;
          if (retryCount >= maxRetry) {
            reject(err);
          } else {
            setTimeout(retry, delay);
          }
        });
    };
    retry();
  });
}

export function timeout<T>(promise: () => Promise<T>, ms: number = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    promise().then(resolve).catch(reject);

    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error('promise timeout'));
    }, ms);
  });
}


export async function when(condition: () => boolean) {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve()
      }
    }, 50)
  })
}
