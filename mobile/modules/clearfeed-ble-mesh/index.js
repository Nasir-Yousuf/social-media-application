import { requireOptionalNativeModule, EventEmitter } from 'expo-modules-core';

const ClearFeedBleMesh = requireOptionalNativeModule('ClearFeedBleMesh');
export const BleMeshEventEmitter = ClearFeedBleMesh ? new EventEmitter(ClearFeedBleMesh) : null;

export default ClearFeedBleMesh;
