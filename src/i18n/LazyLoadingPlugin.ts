import { BackendModule, InitOptions, MultiReadCallback, ReadCallback, ResourceLanguage, Services } from "i18next";

export default class LazyLoadingPlugin implements BackendModule {

  type: "backend";

  constructor(_services: Services, _backendOptions: object, _i18nextOptions: InitOptions<object>) {
    this.type = "backend";
  }

  init(_services: Services, _backendOptions: object, _i18nextOptions: InitOptions<object>): void {
    // no init needed
  }

  read(language: string, _namespace: string, callback: ReadCallback): void {
    import(`./locales/${language}.json`).then(
      obj => {
        callback(null, obj);
      }
    );
  }
  create?(_languages: readonly string[], _namespace: string, _key: string, _fallbackValue: string): void {
    throw new Error("Method not implemented.");
  }
  readMulti?(_languages: readonly string[], _namespaces: readonly string[], _callback: MultiReadCallback): void {
    throw new Error("Method not implemented.");
  }
  save?(_language: string, _namespace: string, _data: ResourceLanguage): void {
    throw new Error("Method not implemented.");
  }

}
