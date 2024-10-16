package org.example.funqy;

import io.quarkus.funqy.Funq;
import jakarta.transaction.Transactional;

public class GreetingFunction {

	@Funq
	@Transactional
	public Person persist(Person friend) {
		friend.persist();
		return friend;
	}
}
