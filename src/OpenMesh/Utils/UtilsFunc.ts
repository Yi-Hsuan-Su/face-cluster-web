export function assert(input: boolean) {
    if (!input) {
        throw new Error("Error!");
    }
}

export function resize<T>(arr: any, newSize: number, defaultValue: T): Promise<T[]> {
    return new Promise(resolve => {
        resolve([...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue)]);
    })
}