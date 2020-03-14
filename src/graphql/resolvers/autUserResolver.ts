import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { AutUser } from "src/models/autUser.model";
import { Context } from 'koa';
import { AutOauthService } from "src/services/aut-oauth";
import { transfields } from '../../constants/tranfields';
import * as jwt from 'jsonwebtoken';
import { DocumentType } from '@typegoose/typegoose';
import * as configFile from '../../config/config';
import {LoginResponse} from '../interfaces/loginResponse.interface';

const jwtConfig = configFile.config.jwt;

@Resolver(of => AutUser)
export class AutUserResolver {

    @Mutation()
    async login(
        @Ctx() ctx: Context
    ): Promise<LoginResponse> {
        const autOauth = new AutOauthService(Number(ctx.body.code));
        const autUserProfile = await autOauth.getUser();
        const stdNumber = String(autUserProfile.std_numbers[0]);
        const usr = await AutUser.findOneOrCreate({ studentNumber: stdNumber }, {
            studentNumber: stdNumber,
            autMail: autUserProfile.email
        });
        if (usr) {
            let user = usr as DocumentType<AutUser>;
            if (stdNumber.startsWith('9531') || transfields.includes(stdNumber)) {
                user.isGraduating = true;
            }
            user = await user.save();
            const token = jwt.sign({ id: user._id }, jwtConfig.secret, {
                expiresIn: jwtConfig.expirePeriod
            });
            return {_id: user._id, token };
        }
        return {};

    }
}