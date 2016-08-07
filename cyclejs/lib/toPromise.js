// From a mostjs stream, returns a promise that resolves (or rejects
// if an error occurs) with the next value from the stream
export default function toPromise(stream) {
  return new Promise((resolve, reject) => {
    // Some streams may call next/error/complete immediately on
    // subscribe(), before we get the Subscription object back!
    let instantlyResolved = false;
    const maybeUnsub = () => (
      !instantlyResolved ? (instantlyResolved=true) : sub.unsubscribe()
    );

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
