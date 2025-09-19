package com.gymai.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{


//Optional<User> means the method might return a user, or it might return nothing

    Optional<User> findByUserName(String userName);
    
    Optional<User> findByEmail(String email);
    
}
