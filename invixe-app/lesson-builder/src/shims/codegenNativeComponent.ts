// Minimal shim for react-native-web environment used by react-native-svg
export default function codegenNativeComponent<T>(_name: string): T {
  // @ts-ignore
  return ({} as T)
}


