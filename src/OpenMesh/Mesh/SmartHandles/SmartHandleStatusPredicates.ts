export default abstract class SmartHandleStatusPredicates<HandleType> {
    abstract feature(): boolean;
    /// Returns true iff the handle is marked as selected
    abstract selected(): boolean;
    /// Returns true iff the handle is marked as tagged
    abstract tagged(): boolean;
    /// Returns true iff the handle is marked as tagged2
    abstract tagged2(): boolean;
    /// Returns true iff the handle is marked as locked
    abstract locked(): boolean;
    /// Returns true iff the handle is marked as hidden
    abstract hidden(): boolean;
    /// Returns true iff the handle is marked as deleted
    abstract deleted(): boolean;
}