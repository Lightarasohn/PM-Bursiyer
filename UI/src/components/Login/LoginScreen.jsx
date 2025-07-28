import "./LoginScreen.css"
import { Card } from "antd";
import { useLocalization } from '../../Localization/LocalizationContext';

const LoginScreen = () => {
    const { t, setLanguage, language } = useLocalization();
    return(
        <>
            <Card>
                 return <h1>{t("welcomeMessage")}</h1>;
            </Card>
        </>
    )

};

export default LoginScreen;