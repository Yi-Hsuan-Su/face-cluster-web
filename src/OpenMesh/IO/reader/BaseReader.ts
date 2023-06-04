import BaseImporter from "../importer/BaseImporter";

export default abstract class BaseReader {
    abstract get_description(): string;
    abstract get_extension(): string;
    abstract get_magic(): string;

    abstract read(_fileContent: string, _bi: BaseImporter, _opt?): boolean;

}