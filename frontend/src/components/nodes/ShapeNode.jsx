import React from 'react'
import { Handle, Position } from 'reactflow'

const ShapeNode = ({ data = {} }) => {
  const {
    label = 'Element',
    shape = 'rectangle',
    background = '#ffffff',
    borderColor = '#1f2937',
    textColor = '#111827',
    width = 160,
    height = 80,
    borderRadius = 12,
    decoration,
  } = data

  const textStyles = {
    color: textColor,
    fontWeight: 600,
    fontSize: 13,
    lineHeight: '1.2',
    textAlign: 'center',
  }

  if (decoration === 'underline') {
    textStyles.textDecoration = 'underline'
  }

  if (decoration === 'dashed') {
    textStyles.borderBottom = `2px dashed ${textColor}`
    textStyles.paddingBottom = 4
  }

  const renderRectangle = () => (
    <div
      className="flex items-center justify-center px-4 py-3"
      style={{
        width,
        minHeight: height,
        backgroundColor: background,
        border: `2px solid ${borderColor}`,
        borderRadius,
        color: textColor,
      }}
    >
      <span style={textStyles}>{label}</span>
    </div>
  )

  const renderCircle = () => {
    const size = Math.max(width, height)
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="flex items-center justify-center px-4"
          style={{
            width: size,
            height: size,
            backgroundColor: background,
            border: `2px solid ${borderColor}`,
            borderRadius: '9999px',
            color: textColor,
          }}
        >
          <span style={textStyles}>{label}</span>
        </div>
      </div>
    )
  }

  const renderDiamond = () => {
    const size = Math.max(width, height)
    const innerSize = size * 0.75

    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: innerSize,
            height: innerSize,
            backgroundColor: background,
            border: `2px solid ${borderColor}`,
            borderRadius: 16,
            transform: 'rotate(45deg)',
            color: textColor,
          }}
        >
          <span
            style={{
              ...textStyles,
              transform: 'rotate(-45deg)',
              display: 'block',
              width: '100%',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    )
  }

  const renderParallelogram = () => (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <div
        className="flex items-center justify-center px-6"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: background,
          border: `2px solid ${borderColor}`,
          color: textColor,
          clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
        }}
      >
        <span style={textStyles}>{label}</span>
      </div>
    </div>
  )

  const renderCylinder = () => {
    const ellipseHeight = Math.max(12, Math.min(26, height * 0.25))
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: background,
            border: `2px solid ${borderColor}`,
            borderRadius: '9999px / 32px',
            color: textColor,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -ellipseHeight / 2,
              left: 0,
              width: '100%',
              height: ellipseHeight,
              borderRadius: '9999px',
              border: `2px solid ${borderColor}`,
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -ellipseHeight / 2,
              left: 0,
              width: '100%',
              height: ellipseHeight,
              borderRadius: '9999px',
              border: `2px solid ${borderColor}`,
              backgroundColor: 'rgba(15, 23, 42, 0.05)',
            }}
          />
          <span style={textStyles}>{label}</span>
        </div>
      </div>
    )
  }

  const renderEntity = () => (
    <div
      className="flex flex-col shadow-sm"
      style={{
        width,
        minHeight: height,
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        backgroundColor: background,
        overflow: 'hidden',
      }}
    >
      <div
        className="px-3 py-2 text-white font-semibold text-sm text-center"
        style={{ backgroundColor: borderColor }}
      >
        {label}
      </div>
      <div className="flex-1 px-3 py-3 space-y-2 bg-white bg-opacity-70">
        <div className="h-2 rounded bg-slate-200" />
        <div className="h-2 rounded bg-slate-200" />
        <div className="h-2 rounded bg-slate-200" />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (shape) {
      case 'circle':
        return renderCircle()
      case 'diamond':
        return renderDiamond()
      case 'parallelogram':
        return renderParallelogram()
      case 'cylinder':
        return renderCylinder()
      case 'entity':
        return renderEntity()
      default:
        return renderRectangle()
    }
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={{ background: borderColor }} />
      <Handle type="target" position={Position.Left} style={{ background: borderColor }} />
      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
      <Handle type="source" position={Position.Right} style={{ background: borderColor }} />
      {renderContent()}
    </div>
  )
}

export default ShapeNode


