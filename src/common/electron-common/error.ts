export function toErrorMessage(message: Error, verbose = false): string {
  if (message instanceof Error) {
    if (verbose)
      return `${message.message}\n${message.stack}`

    else
      return `${message.message}`
  }
  else {
    return message
  }
}
