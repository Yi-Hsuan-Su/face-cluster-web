/* eslint-disable */

const DELETED = 1   ///< Item has been deleted
const LOCKED = 2   ///< Item is locked.
const SELECTED = 4   ///< Item is selected.
const HIDDEN = 8   ///< Item is hidden.
const FEATURE = 16   ///< Item is a feature or belongs to a feature.
const TAGGED = 32   ///< Item is tagged.
const TAGGED2 = 64   ///< Alternate bit for tagging an item.
const FIXEDNONMANIFOLD = 128  ///< Item was non-two-manifold and had to be fixed
const UNUSED = 256   ///< Unused



export default class StatusInfo {
    status_: number;

    constructor() {
        this.status_ = 0;
    }

    deleted() {
        return this.is_bit_set(DELETED);
    };

    set_deleted(_b: boolean) {
        this.change_bit(DELETED, _b);
    };

    locked() {
        return this.is_bit_set(LOCKED);
    };

    set_locked(_b: boolean) {
        this.change_bit(LOCKED, _b);
    };

    selected() {
        return this.is_bit_set(SELECTED);
    };

    set_selected(_b: boolean) {
        this.change_bit(SELECTED, _b);
    };

    hidden() {
        return this.is_bit_set(HIDDEN);
    };

    set_hidden(_b: boolean) {
        this.change_bit(HIDDEN, _b);
    };

    feature() {
        return this.is_bit_set(FEATURE);
    };

    set_feature(_b: boolean) {
        this.change_bit(FEATURE, _b);
    };

    tagged() {
        return this.is_bit_set(TAGGED);
    };

    set_tagged(_b: boolean) {
        this.change_bit(TAGGED, _b);
    };

    tagged2() {
        return this.is_bit_set(TAGGED2);
    };

    set_tagged2(_b: boolean) {
        this.change_bit(TAGGED2, _b);
    };

    fixed_nonmanifold() {
        return this.is_bit_set(FIXEDNONMANIFOLD);
    };

    set_fixed_nonmanifold(_b: boolean) {
        this.change_bit(FIXEDNONMANIFOLD, _b);
    };

    bits() { return this.status_; };

    set_bits(_bits: number) { this.status_ = _bits; };

    is_bit_set(_s: number) { return (this.status_ & _s) > 0; };

    set_bit(_s: number) { this.status_ |= _s; };

    unset_bit(_s: number) { this.status_ &= ~_s; };

    change_bit(_s: number, _b: boolean) {
        if (_b) this.status_ |= _s;

        else this.status_ &= ~_s;
    };
}
