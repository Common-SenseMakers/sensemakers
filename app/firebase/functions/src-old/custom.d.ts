import 'sinon';

declare global {
  namespace NodeJS {
    interface Global {
      enqueueTaskStub: sinon.SinonStub;
    }
  }
}
