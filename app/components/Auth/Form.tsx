import { FunctionComponent, ReactElement } from 'react'
import { Form, Link } from 'remix'

interface FormProps {
    children: ReactElement[]
    formError: string | undefined
    isRegisterForm?: boolean
}

const AuthForm: FunctionComponent<FormProps> = ({
    children,
    formError,
    isRegisterForm = false,
}) => {
    return (
        <div className="flex w-[460px] flex-col gap-8">
            <h1 className="text-dark-purple-200 text-center text-2xl">
                {isRegisterForm ? 'Sign Up' : 'Sign In'}
            </h1>
            <Form
                method="post"
                className="bg-dark-purple-700 flex flex-col gap-2 rounded-md p-8"
            >
                {children}
                <div className="flex items-center justify-between">
                    {isRegisterForm ? (
                        <span className="text-dark-purple-200 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-pink-500">
                                Sign In
                            </Link>
                        </span>
                    ) : (
                        <span className="text-dark-purple-200 text-sm">
                            Don't have an account yet?{' '}
                            <Link to="/register" className="text-pink-500">
                                Sign Up
                            </Link>
                        </span>
                    )}
                    <button
                        type="submit"
                        className="rounded-md bg-pink-500 px-5 py-1 text-sm text-white"
                    >
                        {isRegisterForm ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
                {formError && (
                    <p className="text-sm text-red-400">{formError}</p>
                )}
            </Form>
            <div className="text-dark-purple-300 flex justify-center gap-4 text-sm">
                <Link to="/about">About</Link>
                <Link to="/terms">Terms</Link>
            </div>
        </div>
    )
}

export default AuthForm
