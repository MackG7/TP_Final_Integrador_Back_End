class MockGroupService {
    async createGroup(name, url_img = '') {
        console.log('👥 MOCK Creando grupo:', { name, url_img });
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGroup = {
            _id: 'mock_group_' + Date.now(),
            name,
            description: '',
            url_img,
            createdBy: {
                _id: 'mock_user_1',
                name: 'Usuario Demo',
                email: 'demo@email.com'
            },
            members: [
                {
                    _id: 'mock_user_1',
                    name: 'Usuario Demo',
                    email: 'demo@email.com'
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('✅ MOCK Grupo creado:', mockGroup.name);
        
        return {
            success: true,
            message: 'Grupo creado exitosamente (modo demo)',
            data: mockGroup
        };
    }

    async getGroupList() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            data: []
        };
    }

    async getGroupById(groupId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            data: {
                _id: groupId,
                name: 'Grupo Demo',
                description: 'Este es un grupo de demostración',
                createdBy: {
                    name: 'Usuario Demo',
                    email: 'demo@email.com'
                },
                members: []
            }
        };
    }

    async inviteUser(email, groupId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            message: `Usuario ${email} invitado exitosamente (modo demo)`
        };
    }
}

export default new MockGroupService();