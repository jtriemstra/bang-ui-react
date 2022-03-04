class Utility {
    static apiServer() {
        if (process.env.APP_ENV === 'prod'){
            return "https://wonders-api.herokuapp.com/";
            //return "http://jtriemstrawondersapi-env.eba-tbpj7hm2.us-east-2.elasticbeanstalk.com";
        }
        else {
            return "http://localhost:8080";
            //return "https://wonders-api.herokuapp.com/";
            //return "http://jtriemstrawondersapi-env.eba-tbpj7hm2.us-east-2.elasticbeanstalk.com";
            //return "http://jtriemstradominionapi-env.eba-wcyvhkpu.us-east-2.elasticbeanstalk.com";
        }        
    }

    static postRequestInit(){
        var myHeaders = new Headers();
        myHeaders.append('pragma', 'no-cache');
        myHeaders.append('cache-control', 'no-cache');
        myHeaders.append('content-type', 'application/json');

        var myInit = {
            method: 'POST',
            headers: myHeaders,
        };

        return myInit;
    }
}

export default Utility;
