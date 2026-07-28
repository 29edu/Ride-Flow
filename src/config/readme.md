
# Instance Of

    While Using the error, I have to use instanceOf to check whether the error object belong to the Error class or not.
    On Error class, I can safely perform the error.message.

    error from catch is unknow, we don't know whether the error is custom error or null or strings. String Error just contains text, it is not
    Object so I cannot do error.message.
    error strings doesn't have properties like error.message, error.stack and error.name
    
    if i do const error : string = "Invalid password"
    console.log(error.message) -> message doesn't exist on the type string

    Example

    try {
        throw "Database connection failed"; // Here the error is string
    } catch (error: unknown) {
        
        if(error instanceof Error) {
            console.log(error.message)
        }else {
            console.log(error)
        }
    }

    Null means no Object
    const error = null;
    console.log(error.message) -> This crashes because there is no object from which javascript can read message

    eg:-

        try {
            throw null;
        } catch(error : unknown) {
            if(error instanceof Error) {
                console.log(error.message)
            } else {
                console.log("Non-error value:", error)
            }
        }

    Common Built In Errors

    new Error("General Failure")
    new TypeError("Expected a string")
    new ReferenceError
    new Syntax Error
    new Range Error

    Some properties I can use on error Objects 
    1. name -> Name of the error
    2. message -> What went wrong
    3. stack -> When did it happen