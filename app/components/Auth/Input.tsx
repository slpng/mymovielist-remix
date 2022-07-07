import { FunctionComponent } from "react"

interface InputProps {
  type: string
  name: string
  placeholder: string
  ariaInvalid: boolean
  ariaDescribedby: string | undefined
  error: string | undefined
}

const AuthInput: FunctionComponent<InputProps> = ({
  type,
  name,
  placeholder,
  ariaInvalid,
  ariaDescribedby,
  error
}) => (
  <div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
      className="
                bg-dark-purple-800
                text-dark-purple-200
                placeholder:text-dark-purple-300
                focus:placeholder:text-dark-purple-400
                h-10
                w-full
                rounded-md
                px-5
                py-2
                text-sm
                focus:outline
                focus:outline-2
                focus:outline-pink-500
            "
    />
    {error && (
      <p id="username-error" className="text-sm text-red-400">
        {error}
      </p>
    )}
  </div>
)

export default AuthInput
