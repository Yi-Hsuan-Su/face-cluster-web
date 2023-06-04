import BaseProperty from './BaseProperty';

export default class PropertyT<T> extends BaseProperty {
    constructor(_name: string = "<unknown>",
        _internal_type_name: string = "<unknown>",) {
        super(_name, _internal_type_name);
    }
    private data_: T[] = [];
    set(index: number, data: T) {
        if (this.data_.length < index + 1) {
            this.data_.length = index + 1;
        }
        this.data_[index] = data;
    }
    data() {
        return this.data_;
    }
}