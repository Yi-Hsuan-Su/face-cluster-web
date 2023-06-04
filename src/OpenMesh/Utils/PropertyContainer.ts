import Property from './Property';
import { BasePropHandle } from '../Mesh/Handles/PropHandles';
import BaseProperty from './BaseProperty';
import BaseHandle from '../Mesh/Handles/BaseHandle';

export default class PropertyContainer {
    private properties_: Property<any>[];
    constructor() {
        this.properties_ = [];
    }

    properties() {
        return this.properties_;
    }

    size() {
        return this.properties_.length;
    }

    add<T>(instance: T, _name: string = "<unknown>"): BasePropHandle<T> {
        const property = new Property<T>(_name, instance.constructor.name)
        this.properties_.push(property);
        return new BasePropHandle<T>(this.properties_.length - 1);
    }
    async_add<T>(instance: T, _name: string = "<unknown>"): Promise<BasePropHandle<T>> {
        return new Promise(resolve => {
            const property = new Property<T>(_name, instance.constructor.name)
            this.properties_.push(property);
            resolve(new BasePropHandle<T>(this.properties_.length - 1));
        })
    }
    handle<T>(instance: T, _name: string = "<unknown>"): BasePropHandle<T> {

        this.properties_.forEach((property, index) => {
            if (property.deleted() === false &&
                property.name() === _name &&
                property.internal_type_name() === typeof instance) {
                return new BasePropHandle<T>(index);
            }
        });
        return new BasePropHandle<T>();
    }

    property<T>(input: BasePropHandle<T>): Property<T> {
        return this.properties_[input.idx()];
    }

    set_property<T>(input: BasePropHandle<T>, _h: BaseHandle, data: T) {
        this.properties_[input.idx()].set(_h.idx(), data);
    }

    property_name(input: string): BaseProperty {
        this.properties_.forEach((property, index) => {
            if (property.deleted() === false &&
                property.name() === input
            ) {
                return this.properties_[index];
            }
        });
        return;
    }

    remove(_h: BasePropHandle<any>) {
        this.properties_[_h.idx()] = undefined;
    }

    clear() {
        this.properties_ = [];
    }
}