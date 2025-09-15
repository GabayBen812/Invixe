import React from 'react'

type AnyProps = React.SVGProps<SVGElement> & { children?: React.ReactNode }

const pass = (Tag: any) => (props: AnyProps) => <Tag {...props} />

const Svg = (props: AnyProps) => <svg {...props} />
export default Svg

export const Path = pass('path')
export const G = pass('g')
export const Ellipse = pass('ellipse')
export const Defs = pass('defs')
export const LinearGradient = pass('linearGradient')
export const Stop = pass('stop')
export const Mask = pass('mask')
export const Rect = pass('rect')
export const Circle = pass('circle')
export const ClipPath = pass('clipPath')
export const Filter = pass('filter')
export const FeFlood = pass('feFlood')
export const FeColorMatrix = pass('feColorMatrix')
export const FeOffset = pass('feOffset')
export const FeGaussianBlur = pass('feGaussianBlur')
export const FeComposite = pass('feComposite')
export const FeBlend = pass('feBlend')
export const TSpan = pass('tspan')
export const Text = pass('text')


