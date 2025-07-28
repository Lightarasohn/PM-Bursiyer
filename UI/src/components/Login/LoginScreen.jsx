import "./LoginScreen.css"
import { Card } from "antd";
import { useLocalization } from '../../Localization/LocalizationContext';

const LoginScreen = () => {
    const { currentLanguage } = useLocalization();
    return(
        <>
            <Card>
                 return <h1>{currentLanguage("welcomeMessage")}</h1>;
            </Card>
        </>
    )

};

export default LoginScreen;