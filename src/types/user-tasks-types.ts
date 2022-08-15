export type User = {
    login: string,
    pass: string,
    sid: string,
    items: {id: string, text: string, checked: boolean}[]
};
export type TaskItem = {
    id: string,
    text: string,
    checked: boolean
};
export type UsersData = {
    usersArr: User[],
    user: User | undefined
};
export type InputCred = {
    login: string, 
    pass: string
};