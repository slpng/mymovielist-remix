import { json } from "remix"

export const badRequest = (data: object) => json(data, { status: 400 })

export const validateUsername = (username: string) => {
  if (typeof username !== "string" || username.length < 2) {
    return "Username must be at least 2 characters long"
  }
}

export const validateEmail = (email: string) => {
  // https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression#:~:text=or%3A-,(%3F%3A%5Ba%2Dz0%2D9!%23%24%25%26%27*%2B/%3D%3F%5E_%60%7B%7C%7D~%2D%5D%2B(%3F%3A%5C.%5Ba%2Dz0%2D9!%23%24%25%26%27*%2B/%3D%3F%5E_%60%7B%7C%7D~%2D%5D%2B)*%7C%22(%3F%3A%5B%5Cx01%2D%5Cx08,x21%2D%5Cx5a%5Cx53%2D%5Cx7f%5D%7C%5C%5C%5B%5Cx01%2D%5Cx09%5Cx0b%5Cx0c%5Cx0e%2D%5Cx7f%5D)%2B)%5C%5D),-Here%20is%20diagram
  const regex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

  if (typeof email !== "string" || !regex.test(email)) {
    return "Invalid email address"
  }
}

export const validatePassword = (password: string) => {
  if (typeof password !== "string" || password.length < 3) {
    return "Password must be at least 6 characters long"
  }
}
