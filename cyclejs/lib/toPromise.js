// From a mostjs stream, returns a promise that resolves (or rejects
// if an error occurs) with the next value from the stream
export default function toPromise(stream) {
  return new Promise((resolve, reject) => {
    let instantlyResolved = false;
    const maybeUnsub = () => !instantlyResolved ? (instantlyResolved=true) : sub.unsubscribe();

    const sub = stream.subscribe({
      next: x => (maybeUnsub(), resolve(x)),
      error: e => (maybeUnsub(), reject(e)),
      complete: () => (maybeUnsub(), resolve(undefined)),
    });

    if (instantlyResolved) {
      sub.unsubscribe();
    }
  });
}
