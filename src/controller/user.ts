import Bcrypt from "../services/bcrypt";
import users, {Iuser} from "../model/user";

 export default class Ctrluser{

    /**
     * 
     * @param body 
     * @returns 
     */
    static async create(body:any): Promise<Iuser> {
        const hash = await Bcrypt.hashing(body.password);
        const data = {
            ...body,
            password: hash,
    };
   
    return users.create(data);
    
}
    /**
     * 
     * @param email 
     * @param password 
     * @returns 
     */
    static async auth(email:string,password:string): Promise<Iuser> {
        //fetch data from database
        const user=  await users.findOne({email}).lean()
        //check user is exists or not
        if (user)
        {
                //comparing the password with hash
            const res= await Bcrypt.comparing(password, user.password);
                //check correct or not
                if(res) return user;
                else throw new Error("wrong password")
        }
        else throw new Error("user not exists");
       
    }

}
