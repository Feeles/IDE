import MinecraftEventEmitter from './event-emitter';

export default class MinecraftAgent extends MinecraftEventEmitter {
  constructor(mc) {
    super();
    // minecraft.send をそのまま利用する
    this.send = (...params) => mc.send(...params);
  }

  /**
   * @param direction String
   */
  move(direction) {

  }

  /**
   * @param direction String
   */
  turn(direction) {

  }

  /**
   * @param direction String
   */
  attack(direction) {

  }

  tp() {
    // tpagent
  }


}
