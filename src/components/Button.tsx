import React from 'react'

interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

const Button: React.FunctionComponent<ButtonProps> = ({
  onClick,
  disabled,
  children,
}) => {
  return (
    <button
      className=" bg-gray-900 p-1 text-base text-gray-300 rounded-md border-gray-300 border-solid"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
