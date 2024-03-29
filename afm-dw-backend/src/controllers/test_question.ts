import { Client } from 'pg';
import express from 'express';
import {
    test_get_db, 
    test_question_get_db, 
    test_answer_get_db, 
    test_post_db, 
    test_answer_post_db, 
    test_put_db, 
    createTestSessionDB,
    putTestSessionDB,
    createTestSessionAnswerDB,
    putTestSessionAnswerDB,
    getTestSessionDB,
    getTestSessionAnswerDB,
    createTestQuestionDB,
    createTestQuestionRelDB,
    testQuestionPutDB,
    test_answer_put_db,
    test_question_rel_post_db,
    test_question_rel_put_db,
    test_question_rel_get_db,
    getTestListDB,
    test_department_get_db,
    test_department_post_db,
    test_department_delete_db
} from '../db_apis/test_question';
import createBind from '../utils/create-bind';
import get_client from '../loaders/database';
import log from '../config/logger';

export async function test_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await test_get_db(bind, client);
        if(bind.is_admin) {
            result = await Promise.all(result.map(async (item: any) => {
                let {rows} = await test_department_get_db(client, {id: item.id, lang: bind.lang})
                item.departments = rows
                return item
            }))
        }
        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function test_question_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await test_question_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function test_answer_get (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        let result = await test_answer_get_db(bind, client);

        res.locals.data = {
            statusCode: 200,
            data: result
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function test_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          
        await client.query('BEGIN')
        let test_id = await test_post_db(bind, client);

        if(bind.departments) {
            if(!bind.departments.length) {
                bind.departments.push(-1)
            }
            await Promise.all(
                bind.departments.map(async (department: any) => {
                    await test_department_post_db(client, {department_id: department, id: test_id.id, create_user: bind.user_name, update_user: bind.user_name})
                })
            ) 
        }
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: test_id
        }


        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function test_answer_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);   
        await client.query('BEGIN')
        if(bind.is_correct && bind.question_type_id == 1) {
            let correct_answers = await test_answer_get_db({testquestionid: bind.test_question_id, lang: bind.lang, is_correct: true}, client)
            if(correct_answers.length) {
                throw `Может быть только один правильный ответ`
            }
        }
        const question_id = await test_answer_post_db(bind, client);

        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: question_id
        }


        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}
export async function test_question_rel_post (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);
        await client.query('BEGIN')
        await checkQuestion(bind, client)
        const question_id = await test_question_rel_post_db(bind, client);
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: question_id
        }
        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}
export async function test_question_rel_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          
        await client.query('BEGIN')
        const question_id = await test_question_rel_put_db(bind, client);
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: question_id
        }

        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}



export async function test_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);
        await client.query('BEGIN')

        if(bind.status == 2) {
            const questions = await test_question_rel_get_db({test_id: bind.id}, client)
            if(!questions.length) {
                throw `В тесте нет вопросов, публикация невозможна`
            }

            await Promise.all(questions.map(async (question : any) => {
                await checkQuestion({test_question_id: question.test_question_id, lang: bind.lang, isCheckTest: true}, client)
            })).catch(err => {throw err})
        }
        let test_id = await test_put_db(bind, client);

        if(!bind.departments) {
            bind.departments = []
        } if(!bind.departments.length) {
            bind.departments.push(-1)
        }

        await test_department_delete_db(client, {test_id: bind.id, user_name: bind.user_name})
        await Promise.all(
            bind.departments.map(async (department: any) => {
                await test_department_post_db(client, {department_id: department, id: bind.id, create_user: bind.user_name, update_user: bind.user_name})
            })
        )
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 204,
        }


        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export async function test_answer_put (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          
        await client.query('BEGIN')
        if(bind.is_correct && bind.question_type_id == 1) {
            let correct_answers = await test_answer_get_db({testquestionid: bind.test_question_id, lang: bind.lang, is_correct: true}, client)
            if(correct_answers.length) {
                throw `Может быть только один правильный ответ`
            }
        }
        let test_id = await test_answer_put_db(bind, client);
        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: test_id
        }


        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function getTestSession (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        const sessions = await getTestSessionDB(client, {
            testId: parseInt(bind.testid, 10),
            employee_name: bind.employee_name,
            lang: bind.lang
        });

                res.locals.data = {
            statusCode: 200,
            data: sessions
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function getTestSessionAnswer (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();
        const bind: any = createBind(req);          

        const sessions = await getTestSessionAnswerDB(client, {
            testSessionId: parseInt(bind.test_session_id, 10),
            lang: bind.lang
        });

                res.locals.data = {
            statusCode: 200,
            data: sessions
        }

        next();
    } catch (error) {
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function createTestSession(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

                await client.query('BEGIN');
        const bind: any = createBind(req); 

        const questionIds = (await test_question_get_db({
            lang: bind.lang,
            test_id: parseInt(bind.testid, 10)
        }, client)).reduce((acc: any, item: any) => {
            acc.push(item.id)
            return acc
        }, [])


        const testSessionId = await createTestSessionDB(client, {
            lang: bind.lang,
            employeeId: parseInt(bind.employeeid, 10),
            testId: parseInt(bind.testid, 10),
            testQuestionQTY: questionIds.length,
            create_user: bind.user_name
        });

        for (let i = 0; i < questionIds.length; i++) {

            const correctAnswerId = (await test_answer_get_db({
                testquestionid: questionIds[i],
                lang: bind.lang
            },client)).find((item: any) => item.is_correct);

            await createTestSessionAnswerDB(client, {
                testSessionId: testSessionId.id,
                questionId: questionIds[i],
                correctAnswerId: correctAnswerId?.id || null
            });
        }

        await client.query('COMMIT');

        res.locals.data = {
            statusCode: 201,
            data: {
                testSessionId:  testSessionId
            }
        };
        next();
    } catch (err) {
        log.error(err)
        if(client) {
            await client.query('ROLLBACK')
        }

        next(err);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

async function putTestSession(req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        await client.query('BEGIN');
        const bind: any = createBind(req); 

        const allTestSessionAnswer = await getTestSessionAnswerDB(client, {
            lang: bind.lang,
            testSessionId: parseInt(bind.testsessionid, 10)
        });


        let currentAnswerUserCount = 0;
        for (let i = 0; i < bind.testsessionanswer.length; i++) {

            const testSessionAnswer = allTestSessionAnswer.find((item: any) => item.question_id === bind.testsessionanswer[i].questionId && item.test_session_id === parseInt(bind.testsessionid, 10));

            if (testSessionAnswer.correct_answer_id === bind.testsessionanswer[i].userAnswerId) {
                currentAnswerUserCount += 1;
            }

            await putTestSessionAnswerDB(client, {
                userAnswerId: bind.testsessionanswer[i].userAnswerId,
                id: testSessionAnswer.id
            })
        }


        await putTestSessionDB(client, {
            updateUser: bind.user_name,
            testQuestionCorrectQty: currentAnswerUserCount,
            statusId: bind.statusid,
            endTime: true,
            id: parseInt(bind.testsessionid, 10),
        })

                await client.query('COMMIT');

        const testSession = await getTestSessionDB(client, {
            employeeId: parseInt(bind.employeeid, 10),            
            lang: bind.lang,
            testId: parseInt(bind.testid, 10)
        });

        res.locals.data = {
            statusCode: 200,
            data: {
                testSessionId: parseInt(bind.testsessionid, 10),
                currentAnswerUserCount: currentAnswerUserCount,
                startTime: testSession[0].start_time,
                endTime: testSession[0].end_time,
            }
        }
        next();
    } catch (err) {
        if(client) {
            await client.query('ROLLBACK')
        }

        next(err);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

async function createTestQuestion (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

               const bind: any = createBind(req);          

               await client.query('BEGIN')

               const questionId = await createTestQuestionDB(client, {
            testQuestionTypeId: bind.test_question_type_id,
            nameRus: bind.name_rus,
            nameKaz: bind.name_kaz,
            descriptionRus: bind.description_rus,
            descriptionKaz: bind.description_kaz,
            createUser: bind.user_name,
            updateUser: bind.user_name,
        });

        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: {
                questionId: questionId.id
            }
        }
        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }

        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}


async function putTestQuestion (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        const bind: any = createBind(req);

        await client.query('BEGIN')

        await testQuestionPutDB(client, {
            testQuestionTypeId: bind.test_question_type_id,
            nameRus: bind.name_rus,
            nameKaz: bind.name_kaz,
            descriptionRus: bind.description_rus,
            descriptionKaz: bind.description_kaz,
            isActive: bind.is_active,
            updateUser: bind.user_name,
            id: bind.id
        });

        await client.query('COMMIT')

        res.locals.data = {
            statusCode: 200,
            data: {
                id: bind.id
            }
        }
        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

async function getTestList (req: express.Request, res: express.Response, next: express.NextFunction) {
    let client: Client | null = null;
    try {
        client = get_client(); await client.connect();

        const bind: any = createBind(req);

        await client.query('BEGIN')

        let result = await getTestListDB(client, {
            is_deleted: bind.is_deleted,
            employeeId: bind.employeeid,
            name: bind.name,
            lang: bind.lang,
            testId: bind.testid,
            ispageemployeepassingtest: bind.ispageemployeepassingtest,
        })

        if (result.length && bind.ispaigtestinprogress && Boolean(JSON.parse(bind.ispaigtestinprogress))) {

            const checkPassedTest = await getTestSessionDB(client, {
                lang: bind.lang,
                employeeId: parseInt(bind.employeeid, 10),
                testId: parseInt(bind.testid, 10)
            });
            result = {...result[0], startTime: new Date(checkPassedTest[0].start_time + '+0000'), testSessionAnswer: []};

            const getQuestionByTestID = await test_question_get_db({test_id: result.test_id, lang: bind.lang,}, client);

            for (let i = 0; i < getQuestionByTestID.length; i++) {

                const getAnswerByQuestionID = await test_answer_get_db({testquestionid: getQuestionByTestID[i].id, lang: bind.lang,}, client);

                const question = getAnswerByQuestionID.reduce((acc: any, item: any) => {
                    acc.questionId = getQuestionByTestID[i].id;
                    acc.questionName = getQuestionByTestID[i].name;
                    acc.answers.push({
                        answerId: item.id,
                        name: item.name,
                        questionId: item.test_question_id,
                    })

                    return acc;
                }, {
                    questionId: null,
                    questionName: null,
                    answers: []
                })
                question.answers = question.answers.sort((a: any, b : any) => 0.5 - Math.random())
                result.testSessionAnswer.push(question)
            }
                result.testSessionAnswer = result.testSessionAnswer.sort((a: any, b : any) => 0.5 - Math.random())
        }

        if (result.length && bind.ispageemployeepassingtest && Boolean(JSON.parse(bind.ispageemployeepassingtest))) {
            result = result.map((item: any) => ({...item, start_time: new Date(item.start_time + '+0000'), end_time: new Date(item.end_time + '+0000')}))
        }


        await client.query('COMMIT')
        res.locals.data = {
            statusCode: 200,
            data: result
        }
        next();
    } catch (error) {
        if(client) {
            await client.query('ROLLBACK')
        }
        next(error)
    } finally {
        if (client) {
            await client.end()
        }
    }
}

export {
    createTestSession,
    putTestSession,
    createTestQuestion,
    putTestQuestion,
    getTestList,
    getTestSession,
    getTestSessionAnswer
}

async function checkQuestion(bind: any, client: Client | null) {
    try {
        if (!client) {
            throw('invalid connection')
        }
        const answers = await test_answer_get_db({testquestionid: bind.test_question_id, lang: bind.lang,}, client);

        if(!answers.length) {
            throw `В вопросе №${bind.test_question_id} нет ни одного варианта ответа`
        }

        if(!answers.find((item: any) => item.is_correct)) {
            throw `В вопросе №${bind.test_question_id} нет ни одного правильного варианта`
        }

        if(!answers.find((item: any) => item.is_correct == false)) {
            throw `В вопросе №${bind.test_question_id} нет ни одного неправильного варианта`
        }

        if(!bind.isCheckTest) {
            const rels = await test_question_rel_get_db(bind, client)
            if(rels.length) {
                throw `Этот вопрос уже есть в тесте`
            }
        }
    } catch (error) {
        throw error
    }
}