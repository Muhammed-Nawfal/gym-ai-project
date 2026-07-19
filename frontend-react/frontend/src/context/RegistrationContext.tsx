import type { Goal } from "../types/Goal";
import type { SkillLevel } from "../types/SkillLevel";
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface RegistrationData {    
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    
    height: string;
    weight: string;
    goalWeight: string;
    userGoal: Goal | string;
    skillLevel: SkillLevel | string;
    dob: string;
    profilePictureUrl: string;
}

interface RegistrationContextType {
    registrationData: RegistrationData;
    updateRegistrationData: (data: Partial<RegistrationData>) => void;
    clearRegistrationData: () => void;
}

const initialData: RegistrationData = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  height: '',
  weight: '',
  goalWeight: '',
  userGoal: '',
  skillLevel: '',
  dob: '',
  profilePictureUrl: '',
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(initialData);

    const updateRegistrationData = (data:Partial<RegistrationData>) => {
        setRegistrationData((prev) => ({
            ...prev,
            ...data,
        }));
    }

    const clearRegistrationData = () => {
        setRegistrationData(initialData);
    }

    return (
        <RegistrationContext.Provider
            value={{
                registrationData,
                updateRegistrationData,
                clearRegistrationData
            }}   
        >
            {children}
        </RegistrationContext.Provider>
    );

};


export const useRegistration = () => {
    const context = useContext(RegistrationContext);

    if (!context) {
        throw new Error('useRegistration must be used within RegistrationProvider');
    }
    
    return context;
};
