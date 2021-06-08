export function autobind(_: any, _2: string,  descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    return  <PropertyDescriptor> {
        configurable: true,
        get() {
            return originalMethod.bind(this);

        }
    }
}
