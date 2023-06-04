export default class BaseHandle {

    private idx_: number;
    constructor(_idx: number = -1) {
        this.idx_ = _idx;
    }
    /// Get the underlying index of this handle
    idx(): number { return this.idx_ }
    /// The handle is valid iff the index is not negative.
    is_valid(): boolean {
        return this.idx_ >= 0;
    }
    /// reset handle to be invalid
    reset() { this.idx_ = -1; }
    /// reset handle to be invalid
    invalidate() { this.idx_ = -1; }

    //OPERATOR
    //todo???

    // this is to be used only by the iterators

    __increment(amount?: number) {
        if (amount !== undefined) {
            this.idx_ += amount;
        } else {
            ++this.idx_;
        }
    }

    __decrement(amount?: number) {
        if (amount !== undefined) {
            this.idx_ -= amount;
        } else {
            --this.idx_;
        }
    }
}