module.exports = {
    ALL_CHARACTERS : 'abcdefghijklmnopqrstuvwxyz0123456789',
    // Expected values
    REQUEST_METHODS : ['get', 'post', 'put', 'delete'],
    REQUEST_PROTOCOLS : ['https', 'http'],

    // Endpoints/data dirs
    USERS : 'users',
    TOKENS : 'tokens',
    CARTS : 'carts',
    ORDERS : 'orders',

    //Error messages
    ERROR_NO_POST_SUPPORT : 'This service does not support POST',
    ERROR_NO_GET_SUPPORT : 'This service does not support GET',
    ERROR_NO_PUT_SUPPORT : 'This service does not support PUT',
    ERROR_NO_DELETE_SUPPORT : 'This service does not support DELETE',
    ERROR_TOKEN_DOES_NOT_EXIST : 'Token does not exist',
    ERROR_CANNOT_PERFORM_OPERATION : 'Could not perform operation - invalid token',
    ERROR_MISSING_AUTH_TOKEN : 'Missing auth token',
    ERROR_CANNOT_FIND_TOKEN : 'Auth token not found',
    ERROR_MISSING_REQUIRED_FIELDS : 'Missing required fields',
    ERROR_CANNOT_CREATE_CONTEXT : 'Could not create user context',
    ERROR_CANNOT_FIND_CART : 'Could not find shopping cart',
    ERROR_CANNOT_CREATE_ORDER : 'Could not create order',
    ERROR_CANNOT_DELETE_CART : 'Could not delete shopping cart',
    ERROR_CANNOT_FIND_USER : 'Could not find user',
    ERROR_CANNOT_UPDATE_USER : 'Could not update user',
    ERROR_PAYMENT_FAILED : 'User payment failed',
    ERROR_CANNOT_SENT_NOTIFICATION : 'Could not send order confirmation email',
    ERROR_CANNOT_FIND_ORDER : 'Could not find order',
    ERROR_CANNOT_DELETE_USER : 'Could not delete user',
    ERROR_CANNOT_DELETE_ORDER : 'Could not delete order',
    ERROR_MISSING_FIELDS_TO_UPDATE : 'Missing fields to update',
    ERROR_MISSING_REQUIRED_USER_FIELDS : 'Missing required user fields',
    ERROR_USER_EXISTS : 'User already exists',
    ERROR_CANNOT_HASH_PASSWORD : 'Could not hash password',
    ERROR_CANNOT_CRETE_USER : 'Could not create user',
    ERROR_CANNOT_UPDATE_CART : 'Could not update shopping cart',
    ERROR_CART_EXISTS : 'Shopping cart already exists',
    ERROR_CANNOT_SAVE_CART : 'Could not save shopping cart',
    ERROR_TOKEN_EXPIRED : 'Token has expired',
    ERROR_CANNOT_UPDATE_TOKEN : 'Could not update auth token',
    ERROR_CANNOT_CONSTRUCT_MENU : 'Could not constuct menu',
    ERROR_AUTHENTICATION_FAILED : 'Authentication failed',
    ERROR_CLOSING_FILE : 'Error while closing file',
    ERROR_WRITING_TO_FILE : 'Error writing to file',
    ERROR_CANNOT_UPDATE_FILE : 'Could not open the file for updating, it may not exist yet',
    ERROR_DELETING_FILE : 'Error deleting file',
    ERROR_TRUNCATING_FILE : 'Error truncating file',
    ERROR_CANNOT_CREATE_FILE : 'Could not create new file, it may already exist',

    //Success
    SUCCESS_USER_DELETED : 'User deleted',
    SUCCESS_USER_UPDATED : 'User updated',
    SUCCESS_USER_CREATED : 'User created',
    SUCCESS_CART_DELETED : 'Shopping cart deleted',
    SUCCESS_CART_UPDATED : 'Shopping cart updated',
    SUCCESS_CART_SAVED : 'Shopping cart saved',
    SUCCESS_TOKEN_EXTENDED : 'Token expiration date extended',
  
    //Menu
    MENU_PIZZIA_NAME : 'Uncle Ralph\'s Pizzia',
}

module.exports.Colors = {
    RED : '\x1b[31m%s\x1b[0m',
    GREEN : '\x1b[32m%s\x1b[0m',
    YELLOW : '\x1b[33m%s\x1b[0m',
    MAGENTA : '\x1b[35m%s\x1b[0m',
    LIGHT_BLUE: '\x1b[36m%s\x1b[0m'
}