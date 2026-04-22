declare module 'rubberband-wasm' {
  interface RubberBandStretcher {
    study(
      channelData: Float32Array[],
      numSamples: number,
      isFinal: boolean,
    ): void;
    process(
      channelData: Float32Array[],
      numSamples: number,
      isFinal: boolean,
    ): void;
    available(): number;
    retrieve(numSamples: number): Float32Array[];
    delete(): void;
  }

  interface RubberBandStretcherConstructor {
    new (
      sampleRate: number,
      channels: number,
      options: number,
      timeRatio: number,
      pitchScale: number,
    ): RubberBandStretcher;
    readonly OptionProcessOffline: number;
    readonly OptionProcessRealTime: number;
    readonly OptionFormantShifted: number;
    readonly OptionFormantPreserved: number;
    readonly OptionPitchHighQuality: number;
    readonly OptionPitchHighConsistency: number;
  }

  interface RBModule {
    RubberBandStretcher: RubberBandStretcherConstructor;
  }

  export default function createRubberBand(): Promise<RBModule>;
}
