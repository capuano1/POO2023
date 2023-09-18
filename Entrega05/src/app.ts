import { Bike } from "./bike";
import { Rent } from "./rent";
//PROFESSOR: import { Crypt } from "./crypt"
import { User } from "./user";
import crypto from 'crypto';


export class App {
    users: User[] = []
    bikes: Bike[] = []
    rents: Rent[] = []
    //PROFESSOR: Crypt = new Crypt()
    //Em uma aplicação real, essas coisas estariam em um banco de dados, não no código. Pois o
    //banco de dados é persistente, ou seja, o dado fica ainda que a gente desligue o programa.
    //O programa aqui perderia os dados.

    /*PROFESSOR async*/addUser(name: string, email: string, password: string): void {
        //push adiciona novos elementos em um array
        //Vamos verificar aqui se o usuário já está cadastrado, dentro do array
        //== faz uma comparação mas ignora o tipo de dado, === compara incluindo o tipo de dado
        //'1' == 1 => true; '1' === 1 => false
        //Apesar dos dados nesse caso serem iguais, usamos === para ser mais safe
        //Além do some, temos o every também, que aí todos os elementos do array devem satisfazer
        if (this.users.some(rUser => {return rUser.email === email})) {
            throw new Error("User already exists")
        }
        var user = User.createUser(name, email, password, crypto.randomUUID())

        /* FORMA DO PROFESSOR, COM CRYPT.TS
        const encryptedPassword = await this.crypt.encrypt(user.password)
        user.password = encryptedPassword
        */
        //O professor também retorna o ID do user criado, então retorna Promise<string>.
        this.users.push(user)
    }

    findBike(bike: Bike): void {
        /*Seria mais ou menos assim que funcionaria, porém não consegui achar uma API que não fosse
        paga e que pudesse servir neste quesito (achei apenas a Geolocation API).
        */
        //this.bike.lat = this.getcurrentposition.latitude
        //this.bike.long = this.getcurrentposition.longitude
        //this.bike.alt = this.getcurrentposition.altitude
    }



    /* PROFESSOR AUTH USER
    async authenticate (userEmail: string, password: string): Promise<boolean> {
        const user = this.findUser(userEmail)
        if (!user) throw new Error('User not found')
        return await this.crypt.compare(password, user.password)
    }

    */

    AuthUser(email: string, password: string): boolean {
        const userIndex = this.findUser(email)
        if (userIndex == -1) throw new Error("Wrong email!")
        return User.checkUserPassword(password, this.users[userIndex].password)
    }
    addBike(bike: Bike): void {
        bike.id = crypto.randomUUID()
        this.bikes.push(bike)
    }
    allUsers(): User[] {
        console.log(this.users)
        //Retornamos um slice para podermos retornar uma cópia dele, assim a pessoa que está
        //chamando essa função não terá acesso ao array original, possibilitando a edição não
        //autorizada.
        //Professor desistiu de usar slice já que não funcionaria (aparentemente, o slice manda
        //as referências, é como se copiasse os ponteiros apenas), mas é bom pensar nessa questão.
        //No mundo real, os dados não estariam na memória, estariam no banco de dados, então não
        //haveria tanto problema em retornar ele próprio já que edições não seriam possíveis no
        //original de qualquer maneira.
        //Basicamente, como o VETOR É DE REFERÊNCIAS, ou seja, o que há dentro deste tipo de vetor
        //são referências, ao invés de numbers, strings ou sla, ele cria uma cópia, porém é uma
        //cópia com as referências. Basicamente, isso se dá pois o slice faz uma shallow copy,
        //uma cópia rasa, ao invés de uma deep copy, que aí copiaria os objetos que estão
        //sendo referenciados no vetor, para que não apenas sejam copiados os ponteiros, que iriam
        //indicar para o mesmo objeto / espaço de memória.
        //Era this.users.slice(), this.rents.slice() e this.bikes.slice()
        return this.users
    }
    allRents(): Rent[] {
        console.log(this.rents)
        return this.rents
    }
    allBikes(): Bike[] {
        console.log(this.bikes)
        return this.bikes
    }
    findBikes(UUID: string): number {
        return this.bikes.findIndex(rBike => {return rBike.id === UUID})
    }
    findUser(email: string): number {
        return this.users.findIndex(rUser => {return rUser.email == email})
    }
    findRent(UUID: string, email: string): number {
        return this.rents.findIndex(rRent => {return rRent.bike.id === UUID && rRent.user.email === email})
    }
    removeBike(UUID: string): void {
        var index = this.findBikes(UUID)
        if (index == -1) {
            throw new Error("Bike not found")
        }
        this.bikes.splice(index, 1)
    }
    removeUser(email: string): void {
        var index = this.findUser(email)
        if (index == -1) {
            throw new Error("User not found")
        }
        this.users.splice(index, 1)
    }
    //Passar a descrição da bike e email do user para encontrar e fazer a reserva
    rentBike(UUID: string, email: string, password: string): void {
        const user = this.users[this.findUser(email)]
        if (!User.checkUserPassword(password, user.password)) {
            throw new Error("Wrong Password!")
        }
        const bike = this.bikes[this.findBikes(UUID)]
        if (!bike) throw new Error("Bike not Found")
        if(!bike.available) throw new Error("Unavailable Bike")
        const bRents = this.rents.filter(bRent => bRent.bike.id === bike.id)
        const newRent = new Rent(bike, user, new Date())
        bike.available = false
        this.rents.push(newRent)
    }
    diffHours( dt2: Date, dt1: Date) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000
        diff /= (60*60)
        return Math.abs(diff)
    }
    returnBike(email: string, UUID: string): number {
        //var index = this.findRent(UUID, email)
        const now = new Date()
        const rent = this.rents.find(rent =>
            rent.bike.id === UUID &&
            rent.user.email === email &&
            !rent.dateTo
        )
        if (!rent) throw new Error("Rent not Found")
        rent.dateTo = now
        rent.bike.available = true
        const hours = this.diffHours(rent.dateTo, rent.dateFrom)
        return hours * rent.bike.rate

        //this.rents[index].dateReturned = new Date()
    }
}