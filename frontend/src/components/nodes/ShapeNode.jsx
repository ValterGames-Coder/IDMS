import React, { useMemo } from 'react'
import { Handle, Position } from 'reactflow'
import * as Icons from 'lucide-react'

const DEFAULT_TEXT_STYLES = {
  fontWeight: 600,
  fontSize: 13,
  lineHeight: '1.2',
  textAlign: 'center',
}

const ALL_HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left]

const normalizePosition = (value) => {
  if (!value) return null
  const lookup = String(value).toLowerCase()
  switch (lookup) {
    case 'top':
      return Position.Top
    case 'right':
      return Position.Right
    case 'bottom':
      return Position.Bottom
    case 'left':
      return Position.Left
    default:
      return null
  }
}

const parseHandlePositions = (values) => {
  if (!Array.isArray(values)) {
    return null
  }
  const normalized = values
    .map(normalizePosition)
    .filter((position) => position !== null)

  return [...new Set(normalized)]
}

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
    borderWidth = 2,
    borderStyle = 'solid',
    borderDash,
    innerBorderWidth,
    innerBorderColor,
    showLabelInside = true,
    labelPosition = 'inside',
    fontSize,
    fontWeight,
    icon,
    iconColor,
    iconSize = 20,
    iconPosition = 'top',
    padding = 12,
    header,
    headerPosition = 'top',
    headerBackground = '#e2e8f0',
    headerTextColor = '#0f172a',
    decoration,
  } = data

  const IconComponent = useMemo(() => {
    if (!icon) return null
    const iconName = icon in Icons ? icon : null
    return iconName ? Icons[iconName] : null
  }, [icon])

  const handlesConfig = useMemo(() => {
    const incoming = parseHandlePositions(data.handles?.incoming)
    const outgoing = parseHandlePositions(data.handles?.outgoing)

    return {
      incoming: incoming ?? ALL_HANDLE_POSITIONS,
      outgoing: outgoing ?? ALL_HANDLE_POSITIONS,
    }
  }, [data.handles])

  const positionsWithBoth = useMemo(() => {
    const incomingSet = new Set(handlesConfig.incoming)
    const shared = handlesConfig.outgoing.filter((position) => incomingSet.has(position))
    return new Set(shared)
  }, [handlesConfig])

  const handleDefinitions = useMemo(() => {
    const definitions = []

    handlesConfig.incoming.forEach((position) => {
      definitions.push({ type: 'target', position })
    })

    handlesConfig.outgoing.forEach((position) => {
      definitions.push({ type: 'source', position })
    })

    return definitions
  }, [handlesConfig])

  const baseTextStyles = {
    ...DEFAULT_TEXT_STYLES,
    color: textColor,
  }

  if (fontSize) {
    baseTextStyles.fontSize = fontSize
  }
  if (fontWeight) {
    baseTextStyles.fontWeight = fontWeight
  }

  if (decoration === 'underline') {
    baseTextStyles.textDecoration = 'underline'
  }

  if (decoration === 'dashed') {
    baseTextStyles.borderBottom = `2px dashed ${textColor}`
    baseTextStyles.paddingBottom = 4
  }

  const renderIcon = (sizeOverride) => {
    if (!IconComponent) return null
    const finalSize = sizeOverride || iconSize
    return (
      <IconComponent
        size={finalSize}
        strokeWidth={2}
        style={{
          color: iconColor || textColor,
        }}
      />
    )
  }

  const renderLabel = (position = 'bottom') => (
    <span
      style={{
        ...baseTextStyles,
        marginTop: position === 'bottom' ? 8 : 0,
      }}
    >
      {label}
    </span>
  )

  const renderContentInner = () => (
    <div
      className="flex flex-col items-center justify-center"
      style={{ gap: showLabelInside && icon ? 4 : 0 }}
    >
      {icon && iconPosition !== 'bottom' && renderIcon()}
      {showLabelInside && <span style={baseTextStyles}>{label}</span>}
      {icon && iconPosition === 'bottom' && renderIcon()}
    </div>
  )

  const circleSize = Math.max(width, height)

  const renderCircle = (extraStyles = {}) => (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: circleSize,
          height: circleSize,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: background,
            borderColor,
            borderStyle,
            borderWidth,
            borderRadius: '9999px',
            color: textColor,
            ...(borderDash ? { borderStyle: 'dashed' } : {}),
            ...extraStyles,
          }}
        >
          {renderContentInner()}
        </div>
        {innerBorderWidth && (
          <div
            style={{
              position: 'absolute',
              top: innerBorderWidth,
              left: innerBorderWidth,
              right: innerBorderWidth,
              bottom: innerBorderWidth,
              border: `${innerBorderWidth}px solid ${innerBorderColor || borderColor}`,
              borderRadius: '9999px',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      {!showLabelInside && labelPosition === 'bottom' && renderLabel('bottom')}
    </div>
  )

  const renderRectangle = (extraStyles = {}) => (
    <div
      className="flex flex-col"
      style={{
        width,
        minHeight: height,
        backgroundColor: background,
        borderColor,
        borderStyle,
        borderWidth,
        borderRadius,
        color: textColor,
        ...(borderDash ? { borderStyle: 'dashed' } : {}),
        overflow: 'hidden',
        ...extraStyles,
      }}
    >
      {header && (
        <div
          className={
            headerPosition === 'left'
              ? 'flex items-center px-3'
              : 'px-3 py-2 text-sm font-semibold'
          }
          style={{
            backgroundColor: headerBackground,
            color: headerTextColor,
            minHeight: headerPosition === 'left' ? '100%' : undefined,
            display: headerPosition === 'left' ? 'flex' : undefined,
            alignItems: headerPosition === 'left' ? 'center' : undefined,
            justifyContent: headerPosition === 'left' ? 'center' : undefined,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              writingMode: headerPosition === 'left' ? 'vertical-lr' : 'horizontal-tb',
              transform: headerPosition === 'left' ? 'rotate(180deg)' : undefined,
            }}
          >
            {header}
          </span>
        </div>
      )}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: header ? 12 : padding }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{ gap: icon && showLabelInside ? 6 : 0 }}
        >
          {icon && iconPosition === 'top' && renderIcon()}
          {showLabelInside && <span style={baseTextStyles}>{label}</span>}
          {icon && iconPosition === 'bottom' && renderIcon()}
        </div>
      </div>
      {!showLabelInside && labelPosition === 'bottom' && renderLabel('bottom')}
    </div>
  )

  const renderDiamond = () => (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center"
        style={{ width: circleSize, height: circleSize }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: circleSize * 0.72,
            height: circleSize * 0.72,
            backgroundColor: background,
            borderColor,
            borderStyle,
            borderWidth,
            borderRadius: 16,
            transform: 'rotate(45deg)',
            color: textColor,
          }}
        >
          <div
            style={{
              transform: 'rotate(-45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: icon && showLabelInside ? 6 : 0,
            }}
          >
            {icon && renderIcon()}
            {showLabelInside && <span style={baseTextStyles}>{label}</span>}
          </div>
        </div>
      </div>
      {!showLabelInside && labelPosition === 'bottom' && renderLabel('bottom')}
    </div>
  )

  const renderParallelogram = () => (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: background,
          borderColor,
          borderStyle,
          borderWidth,
          color: textColor,
          clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
          padding,
        }}
      >
        <div className="flex items-center" style={{ gap: icon ? 6 : 0 }}>
          {icon && renderIcon()}
          <span style={baseTextStyles}>{label}</span>
        </div>
      </div>
    </div>
  )

  const renderCylinder = () => {
    const ellipseHeight = Math.max(12, Math.min(26, height * 0.25))
    return (
      <div className="flex flex-col items-center" style={{ width, height }}>
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: background,
            borderColor,
            borderStyle,
            borderWidth,
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
              border: `${borderWidth}px solid ${borderColor}`,
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
              border: `${borderWidth}px solid ${borderColor}`,
              backgroundColor: 'rgba(15, 23, 42, 0.05)',
            }}
          />
          <div className="flex flex-col items-center" style={{ gap: icon ? 6 : 0 }}>
            {icon && renderIcon()}
            <span style={baseTextStyles}>{label}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderLane = () => {
    const isHorizontal = headerPosition === 'top'
    return (
      <div
        className="flex"
        style={{
          width,
          height,
          borderColor,
          borderStyle,
          borderWidth,
          backgroundColor: background,
          color: textColor,
          flexDirection: isHorizontal ? 'column' : 'row',
        }}
      >
        {header && (
          <div
            style={{
              backgroundColor: headerBackground,
              color: headerTextColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isHorizontal ? '6px 12px' : '12px 6px',
              minWidth: isHorizontal ? undefined : Math.max(40, width * 0.08),
              minHeight: isHorizontal ? Math.max(32, height * 0.2) : undefined,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                writingMode: isHorizontal ? 'horizontal-tb' : 'vertical-rl',
                transform: isHorizontal ? undefined : 'rotate(180deg)',
              }}
            >
              {header}
            </span>
          </div>
        )}
        <div className="flex-1" />
      </div>
    )
  }

  const renderDataObject = () => (
    <div
      className="relative"
      style={{
        width,
        minHeight: height,
        color: textColor,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: background,
          borderColor,
          borderStyle,
          borderWidth,
          borderRadius,
          clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)',
        }}
      ></div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: icon ? 6 : 0 }}
      >
        {icon && renderIcon()}
        <span style={baseTextStyles}>{label}</span>
      </div>
    </div>
  )

  const renderAnnotation = () => (
    <div
      className="flex items-center"
      style={{
        width,
        minHeight: height,
        color: textColor,
      }}
    >
      <div
        style={{
          width: 12,
          alignSelf: 'stretch',
          borderTop: `${borderWidth}px solid ${borderColor}`,
          borderBottom: `${borderWidth}px solid ${borderColor}`,
          borderLeft: `${borderWidth}px solid ${borderColor}`,
        }}
      />
      <div
        className="flex-1 px-3 py-2"
        style={{
          backgroundColor: background,
        }}
      >
        <span style={{ ...baseTextStyles, textAlign: 'left' }}>{label}</span>
      </div>
    </div>
  )

  const renderByShape = () => {
    switch (shape) {
      case 'circle':
        return renderCircle()
      case 'diamond':
        return renderDiamond()
      case 'parallelogram':
        return renderParallelogram()
      case 'cylinder':
        return renderCylinder()
      case 'lane':
        return renderLane()
      case 'data-object':
        return renderDataObject()
      case 'annotation':
        return renderAnnotation()
      default:
        return renderRectangle()
    }
  }

  const getHandleStyle = (position, type, hasBoth) => {
    const baseStyle = {
      width: 12,
      height: 12,
      borderRadius: '9999px',
      border: `2px solid ${borderColor}`,
      background: '#ffffff',
      boxShadow: '0 0 0 2px rgba(15, 23, 42, 0.08)',
      pointerEvents: 'auto',
    }

    switch (position) {
      case Position.Top:
        baseStyle.top = 0
        baseStyle.transform = 'translate(-50%, -50%)'
        baseStyle.left = hasBoth
          ? type === 'target'
            ? '35%'
            : '65%'
          : '50%'
        break
      case Position.Bottom:
        baseStyle.bottom = 0
        baseStyle.transform = 'translate(-50%, 50%)'
        baseStyle.left = hasBoth
          ? type === 'target'
            ? '35%'
            : '65%'
          : '50%'
        break
      case Position.Left:
        baseStyle.left = 0
        baseStyle.transform = 'translate(-50%, -50%)'
        baseStyle.top = hasBoth
          ? type === 'target'
            ? '35%'
            : '65%'
          : '50%'
        break
      case Position.Right:
        baseStyle.right = 0
        baseStyle.transform = 'translate(50%, -50%)'
        baseStyle.top = hasBoth
          ? type === 'target'
            ? '35%'
            : '65%'
          : '50%'
        break
      default:
        break
    }

    return baseStyle
  }

  const hasHandles = handleDefinitions.length > 0

  return (
    <div className="relative">
      {hasHandles &&
        handleDefinitions.map((handle) => {
          const handleId = `${handle.type}-${handle.position}`
          const style = getHandleStyle(handle.position, handle.type, positionsWithBoth.has(handle.position))

          return (
            <Handle
              key={handleId}
              id={handleId}
              type={handle.type}
              position={handle.position}
              style={style}
            />
          )
        })}
      {renderByShape()}
    </div>
  )
}

export default ShapeNode




