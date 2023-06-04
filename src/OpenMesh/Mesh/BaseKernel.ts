import PropertyContainer from '../Utils/PropertyContainer'
import { EdgeHandle, FaceHandle, HalfedgeHandle, MeshHandle, VertexHandle } from './Handles/Handles';
import { VPropHandle, HPropHandle, EPropHandle, FPropHandle, MPropHandle, BasePropHandle } from './Handles/PropHandles';
import PropertyT from '../Utils/Property';

export default class BaseKernel {
    vprops_ = new PropertyContainer();
    hprops_ = new PropertyContainer();
    eprops_ = new PropertyContainer();
    fprops_ = new PropertyContainer();
    mprops_ = new PropertyContainer();

    add_property<T>(_ph: VPropHandle<T> | HPropHandle<T> | EPropHandle<T> | FPropHandle<T> | MPropHandle<T>
        , _name?: string, instance?: T) {
        if (_ph instanceof VPropHandle) {
            _ph = new VPropHandle<T>(this.vprops_.add(instance, _name !== undefined ? _name : "<vprop>"))
        }
        if (_ph instanceof HPropHandle) {
            _ph = new HPropHandle(this.hprops_.add(instance, _name !== undefined ? _name : "<hprop>"))
        }
        if (_ph instanceof EPropHandle) {
            _ph = new EPropHandle(this.eprops_.add(instance, _name !== undefined ? _name : "<eprop>"))
        }
        if (_ph instanceof FPropHandle) {
            _ph = new FPropHandle(this.fprops_.add(instance, _name !== undefined ? _name : "<fprop>"))
        }
        if (_ph instanceof MPropHandle) {
            _ph = new MPropHandle(this.mprops_.add(instance, _name !== undefined ? _name : "<mprop>"))
        }
        return _ph;
    }

    async_add_property<T>(_ph: VPropHandle<T> | HPropHandle<T> | EPropHandle<T> | FPropHandle<T> | MPropHandle<T>
        , _name?: string, instance?: T) {
        return new Promise<BasePropHandle<T>>(async resolve => {
            if (_ph instanceof VPropHandle) {
                _ph = new VPropHandle<T>(this.vprops_.add(instance, _name !== undefined ? _name : "<vprop>"))
            }
            if (_ph instanceof HPropHandle) {
                _ph = new HPropHandle(this.hprops_.add(instance, _name !== undefined ? _name : "<hprop>"))
            }
            if (_ph instanceof EPropHandle) {
                _ph = new EPropHandle(this.eprops_.add(instance, _name !== undefined ? _name : "<eprop>"))
            }
            if (_ph instanceof FPropHandle) {
                _ph = new FPropHandle(this.fprops_.add(instance, _name !== undefined ? _name : "<fprop>"))
            }
            if (_ph instanceof MPropHandle) {
                _ph = new MPropHandle(this.mprops_.add(instance, _name !== undefined ? _name : "<mprop>"))
            }
            resolve(_ph);
        })
    }

    property<T>(_ph: VPropHandle<T> | HPropHandle<T> | EPropHandle<T> | FPropHandle<T> | MPropHandle<T>,
        _h?: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle | MeshHandle):
        PropertyT<T> | T {
        if (_ph instanceof VPropHandle) {
            const prop: PropertyT<T> = this.vprops_.property(_ph);
            return _h === undefined ? prop : prop.data()[_h.idx()];
        }
        if (_ph instanceof HPropHandle) {
            const prop: PropertyT<T> = this.hprops_.property(_ph);
            return _h === undefined ? prop : prop.data()[_h.idx()];
        }
        if (_ph instanceof EPropHandle) {
            const prop: PropertyT<T> = this.eprops_.property(_ph);
            return _h === undefined ? prop : prop.data()[_h.idx()];
        }
        if (_ph instanceof FPropHandle) {
            const prop: PropertyT<T> = this.fprops_.property(_ph);
            return _h === undefined ? prop : prop.data()[_h.idx()];
        }
        if (_ph instanceof MPropHandle) {
            const prop: PropertyT<T> = this.mprops_.property(_ph);
            return prop.data()[0];
        }

    }

    set_property<T>(_ph: VPropHandle<T> | HPropHandle<T> | EPropHandle<T> | FPropHandle<T> | MPropHandle<T>,
        _h: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle | MeshHandle, value: T) {
        if (_ph instanceof VPropHandle) {
            this.vprops_.set_property(_ph, _h, value);
        }
        if (_ph instanceof HPropHandle) {
            this.hprops_.set_property(_ph, _h, value);
        }
        if (_ph instanceof EPropHandle) {
            this.eprops_.set_property(_ph, _h, value);
        }
        if (_ph instanceof FPropHandle) {
            this.fprops_.set_property(_ph, _h, value);
        }
        if (_ph instanceof MPropHandle) {
            this.mprops_.set_property(_ph, _h, value);;
        }
    }

    async_set_property<T>(_ph: VPropHandle<T> | HPropHandle<T> | EPropHandle<T> | FPropHandle<T> | MPropHandle<T>,
        _h: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle | MeshHandle, value: T) {
        return new Promise<void>(resolve => {
            if (_ph instanceof VPropHandle) {
                this.vprops_.set_property(_ph, _h, value);
            }
            if (_ph instanceof HPropHandle) {
                this.hprops_.set_property(_ph, _h, value);
            }
            if (_ph instanceof EPropHandle) {
                this.eprops_.set_property(_ph, _h, value);
            }
            if (_ph instanceof FPropHandle) {
                this.fprops_.set_property(_ph, _h, value);
            }
            if (_ph instanceof MPropHandle) {
                this.mprops_.set_property(_ph, _h, value);;
            }
            resolve();
        })
    }
}