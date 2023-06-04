export default class BaseProperty {

    private name_: string;
    private internal_type_name_;
    private presistent_: boolean;
    private deleted_: boolean;

    constructor(_name: string = "<unknown>",
        _internal_type_name: string = "<unknown>",
        _presistent: boolean = false) {
        this.name_ = _name;
        this.internal_type_name_ = _internal_type_name;
        this.presistent_ = _presistent;
        this.deleted_ = false;
    }

    name() {
        return this.name_;
    }

    internal_type_name() {
        return this.internal_type_name_;
    }

    presistent() {
        return this.presistent_;
    }

    deleted() {
        return this.deleted_
    }
}